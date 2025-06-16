package com.mytelmed.core.video.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.constants.file.FileType;
import com.mytelmed.common.constants.file.VideoType;
import com.mytelmed.common.events.deletion.VideoDeletedEvent;
import com.mytelmed.core.video.entity.Video;
import com.mytelmed.core.video.repository.VideoRepository;
import com.mytelmed.infrastructure.aws.dto.S3StorageOptions;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.model.S3Exception;
import java.io.IOException;
import java.util.Optional;
import java.util.UUID;


@Slf4j
@Service
public class VideoService {
    private final VideoRepository videoRepository;
    private final AwsS3Service awsS3Service;
    private final ApplicationEventPublisher eventPublisher;

    public VideoService(VideoRepository videoRepository, AwsS3Service awsS3Service, ApplicationEventPublisher applicationEventPublisher) {
        this.videoRepository = videoRepository;
        this.awsS3Service = awsS3Service;
        this.eventPublisher = applicationEventPublisher;
    }

    @Transactional
    public Video saveAndGetVideo(VideoType videoType, UUID entityId, MultipartFile videoFile) throws IOException, S3Exception, AppException {
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
                    .publicAccess(true)
                    .build();

            log.debug("Uploading video for entity: {} of type: {}", entityId, videoType);
            videoKey = awsS3Service.uploadFileAndGetKey(storageOptions, videoFile);
            String videoUrl = awsS3Service.getFileUrl(videoKey, true, null);

            Video video = Video.builder()
                    .videoKey(videoKey)
                    .videoType(videoType)
                    .entityId(entityId)
                    .videoUrl(videoUrl)
                    .build();

            video = videoRepository.save(video);
            log.info("Saved video to database for entity: {}", entityId);
            return video;
        } catch (IOException | S3Exception e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while saving video for entity: {}", entityId, e);

            if (videoKey != null) {
                eventPublisher.publishEvent(new VideoDeletedEvent(entityId, videoKey));
            }

            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            throw e;
        }
    }

    @Transactional
    public void updateVideo(VideoType videoType, UUID entityId, MultipartFile videoFile) throws AppException {
        if (videoFile == null || videoFile.isEmpty()) {
            log.warn("Attempted to update empty or null video file for entity: {}", entityId);
            throw new InvalidInputException("Video file cannot be empty");
        }

        try {
            Optional<Video> videoOpt = videoRepository.findByVideoTypeAndEntityId(videoType, entityId);

            if (videoOpt.isEmpty()) {
                saveAndGetVideo(videoType, entityId, videoFile);
                return;
            }

            Video video = videoOpt.get();

            log.debug("Updating video for entity: {} of type: {}", entityId, videoType);
            String videoKey = awsS3Service.updateFile(video.getVideoKey(), true, videoFile);
            String videoUrl = awsS3Service.getFileUrl(videoKey, true, null);

            video.setVideoKey(videoKey);
            video.setVideoUrl(videoUrl);

            log.debug("Updating video metadata to database for entity: {}", entityId);
            videoRepository.save(video);

            log.info("Updated video metadata to database for entity: {}", entityId);
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
}
