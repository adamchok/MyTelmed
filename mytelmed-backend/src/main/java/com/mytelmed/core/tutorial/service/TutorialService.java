package com.mytelmed.core.tutorial.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constants.file.ImageType;
import com.mytelmed.common.constants.file.VideoType;
import com.mytelmed.common.events.deletion.VideoDeletedEvent;
import com.mytelmed.core.image.entity.Image;
import com.mytelmed.core.image.service.ImageService;
import com.mytelmed.core.tutorial.dto.CreateTutorialRequestDto;
import com.mytelmed.core.tutorial.dto.UpdateTutorialRequestDto;
import com.mytelmed.core.tutorial.entity.Tutorial;
import com.mytelmed.core.tutorial.repository.TutorialRepository;
import com.mytelmed.core.video.entity.Video;
import com.mytelmed.core.video.service.VideoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.model.S3Exception;
import java.util.UUID;


@Slf4j
@Service
public class TutorialService {
    private final TutorialRepository tutorialRepository;
    private final ImageService imageService;
    private final VideoService videoService;
    private final ApplicationEventPublisher eventPublisher;

    public TutorialService(TutorialRepository tutorialRepository, ImageService imageService, VideoService videoService, ApplicationEventPublisher eventPublisher) {
        this.tutorialRepository = tutorialRepository;
        this.imageService = imageService;
        this.videoService = videoService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public Tutorial findTutorialById(UUID id) throws ResourceNotFoundException {
        return tutorialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tutorial not found with id " + id));
    }

    @Transactional(readOnly = true)
    public Page<Tutorial> findPaginatedTutorialByCategory(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return tutorialRepository.findByCategory(category, pageable);
    }

    @Transactional
    public void createTutorial(CreateTutorialRequestDto request, MultipartFile videoFile, MultipartFile thumbnailImageFile) throws S3Exception, AppException {
        log.debug("Received request to create tutorial with request: {}", request);

        try {
            if (videoFile == null || videoFile.isEmpty()) {
                throw new InvalidInputException("Tutorial video is required");
            }

            if (thumbnailImageFile == null || thumbnailImageFile.isEmpty()) {
                throw new InvalidInputException("Tutorial thumbnail image is required");
            }

            Tutorial tutorial = Tutorial.builder()
                    .title(request.title())
                    .description(request.description())
                    .category(request.category())
                    .build();

            tutorial = tutorialRepository.save(tutorial);

            Video video = videoService.saveAndGetVideo(VideoType.TUTORIAL, tutorial.getId(), videoFile);
            tutorial.setVideo(video);

            Image image = imageService.saveAndGetImage(ImageType.TUTORIAL, tutorial.getId(), thumbnailImageFile);
            tutorial.setThumbnail(image);

            tutorialRepository.save(tutorial);

            log.info("Created tutorial with ID: {}", tutorial.getId());
        } catch (Exception e) {
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            log.error("Unexpected error while creating tutorial: {}", request, e);
            throw new AppException("Failed to create tutorial");
        }
    }

    @Transactional
    public void updateTutorial(UUID tutorialId, UpdateTutorialRequestDto request, MultipartFile videoFile, MultipartFile imageFile) throws AppException {
        log.debug("Received request to update tutorial with ID: {}", tutorialId);

        try {
            Tutorial tutorial = findTutorialById(tutorialId);

            tutorial.setTitle(request.title());
            tutorial.setDescription(request.description());
            tutorial.setCategory(request.category());

            if (videoFile != null && !videoFile.isEmpty()) {
                videoService.updateVideo(VideoType.TUTORIAL, tutorial.getId(), videoFile);
            }

            if (imageFile != null && !imageFile.isEmpty()) {
                imageService.updateImage(ImageType.TUTORIAL, tutorial.getId(), imageFile);
            }

            tutorialRepository.save(tutorial);

            log.info("Updated tutorial with ID: {}", tutorial.getId());
        } catch (Exception e) {
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            log.error("Unexpected error while updating tutorial: {}", tutorialId, e);
            throw new AppException("Failed to update tutorial");
        }
    }

    @Transactional
    public void deleteTutorialById(UUID tutorialId) throws AppException {
        log.debug("Received request to delete tutorial with ID: {}", tutorialId);

        try {
            Tutorial tutorial = findTutorialById(tutorialId);
            String videoKey = tutorial.getVideo() != null ? tutorial.getVideo().getVideoKey() : null;

            tutorialRepository.delete(tutorial);

            if (videoKey != null) {
                eventPublisher.publishEvent(new VideoDeletedEvent(tutorialId, videoKey));
            }

            log.info("Deleted tutorial with ID: {}", tutorial.getId());
        } catch (Exception e) {
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            log.error("Unexpected error while deleting tutorial: {}", tutorialId, e);
            throw new AppException("Failed to delete tutorial");
        }
    }
}
