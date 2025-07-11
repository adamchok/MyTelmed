package com.mytelmed.core.video.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.constant.file.FileType;
import com.mytelmed.common.constant.file.VideoType;
import com.mytelmed.core.video.entity.Video;
import com.mytelmed.core.video.repository.VideoRepository;
import com.mytelmed.infrastructure.aws.dto.S3StorageOptions;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.model.S3Exception;
import ws.schild.jave.EncoderException;
import ws.schild.jave.MultimediaInfo;
import ws.schild.jave.MultimediaObject;
import java.io.File;
import java.io.IOException;
import java.util.Optional;
import java.util.UUID;


@Slf4j
@Service
public class VideoService {
    private final VideoRepository videoRepository;
    private final AwsS3Service awsS3Service;

    public VideoService(VideoRepository videoRepository, AwsS3Service awsS3Service) {
        this.videoRepository = videoRepository;
        this.awsS3Service = awsS3Service;
    }

    @Transactional
    public Video saveAndGetVideo(VideoType videoType, UUID entityId, MultipartFile videoFile)
            throws IOException, S3Exception, AppException, EncoderException {
        String videoKey = null;

        if (videoFile == null || videoFile.isEmpty()) {
            log.warn("Attempted to save empty or null video file for entity: {}", entityId);
            throw new InvalidInputException("Video file cannot be empty");
        }

        try {
            S3StorageOptions storageOptions = S3StorageOptions.builder()
                    .fileType(FileType.VIDEO)
                    .folderName(videoType.name().toLowerCase())
                    .entityId(entityId.toString())
                    .build();

            log.debug("Uploading video for entity: {} of type: {}", entityId, videoType);
            videoKey = awsS3Service.uploadFileAndGetKey(storageOptions, videoFile);

            long videoDuration = getVideoDurationSeconds(videoFile);

            Video video = Video.builder()
                    .videoKey(videoKey)
                    .videoType(videoType)
                    .entityId(entityId)
                    .fileSize(videoFile.getSize())
                    .durationSeconds(videoDuration)
                    .build();

            video = videoRepository.save(video);
            log.info("Saved video to database for entity: {}", entityId);
            return video;
        } catch (IOException | S3Exception e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while saving video for entity: {}", entityId, e);

            if (videoKey != null) {
                try {
                    log.info("Rolling back S3 upload for entity: {} due to database failure", entityId);
                    awsS3Service.deleteFile(videoKey);
                } catch (Exception rollbackEx) {
                    log.error("Failed to roll back S3 upload for entity: {} (key: {})", entityId, videoKey, rollbackEx);
                }
            }

            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            throw e;
        }
    }

    @Transactional
    public Video updateAndGetVideo(VideoType videoType, UUID entityId, MultipartFile videoFile) throws AppException {
        if (videoFile == null || videoFile.isEmpty()) {
            log.warn("Attempted to update empty or null video file for entity: {}", entityId);
            throw new InvalidInputException("Video file cannot be empty");
        }

        try {
            Optional<Video> videoOpt = videoRepository.findByVideoTypeAndEntityId(videoType, entityId);

            if (videoOpt.isEmpty()) {
                return saveAndGetVideo(videoType, entityId, videoFile);
            }

            Video video = videoOpt.get();

            log.debug("Updating video for entity: {} of type: {}", entityId, videoType);
            String videoKey = awsS3Service.updateFile(video.getVideoKey(), videoFile);

            video.setVideoKey(videoKey);
            video.setFileSize(videoFile.getSize());

            long videoDuration = getVideoDurationSeconds(videoFile);
            video.setDurationSeconds(videoDuration);

            log.debug("Updating video metadata to database for entity: {}", entityId);
            video = videoRepository.save(video);

            log.info("Updated video metadata to database for entity: {}", entityId);
            return video;
        } catch (IOException e) {
            log.error("Failed to read video file data for entity: {}", entityId, e);
            throw new InvalidInputException("Failed to read video file");
        } catch (S3Exception e) {
            log.error("AWS S3 error while updating video for entity: {}", entityId, e);
            throw new AppException("Failed to update video");
        } catch (Exception e) {
            log.error("Unexpected error while updating video for entity: {}", entityId, e);
            throw new AppException("Failed to update video");
        }
    }

    private long getVideoDurationSeconds(MultipartFile videoFile) throws IOException, EncoderException {
        File tempFile = File.createTempFile("uploaded_video", null);
        videoFile.transferTo(tempFile);

        try {
            MultimediaObject multimediaObject = new MultimediaObject(tempFile);
            MultimediaInfo info = multimediaObject.getInfo();
            return info.getDuration() / 1000L;
        } finally {
            tempFile.delete();
        }
    }
}
