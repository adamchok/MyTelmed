package com.mytelmed.core.tutorial.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.file.ImageType;
import com.mytelmed.common.constant.file.VideoType;
import com.mytelmed.common.event.image.ImageDeletedEvent;
import com.mytelmed.common.event.video.VideoDeletedEvent;
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
import java.util.UUID;


@Slf4j
@Service
public class TutorialService {
    private final TutorialRepository tutorialRepository;
    private final ImageService imageService;
    private final VideoService videoService;
    private final ApplicationEventPublisher eventPublisher;

    public TutorialService(TutorialRepository tutorialRepository, ImageService imageService, VideoService videoService,
                           ApplicationEventPublisher eventPublisher) {
        this.tutorialRepository = tutorialRepository;
        this.imageService = imageService;
        this.videoService = videoService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public Tutorial findById(UUID id) throws ResourceNotFoundException {
        log.debug("Finding tutorial with ID: {}", id);

        Tutorial tutorial = tutorialRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Tutorial not found with with ID: {}", id);
                    return new ResourceNotFoundException("Tutorial not found");
                });

        log.debug("Found tutorial with ID: {}", id);
        return tutorial;
    }

    @Transactional(readOnly = true)
    public Page<Tutorial> findByCategory(String category, int page, int size) {
        log.debug("Finding tutorial with category {} with page {} and size {}", category, page, size);

        Pageable pageable = PageRequest.of(page, size);
        return tutorialRepository.findByCategory(category, pageable);
    }

    @Transactional
    public Tutorial create(CreateTutorialRequestDto request) throws AppException {
        log.debug("Creating tutorial with request: {}", request);

        try {
            Tutorial tutorial = Tutorial.builder()
                    .title(request.title())
                    .description(request.description())
                    .category(request.category())
                    .build();

            tutorial = tutorialRepository.save(tutorial);

            log.info("Created tutorial with ID: {}", tutorial.getId());
            return tutorial;
        } catch (Exception e) {
            log.error("Unexpected error while creating tutorial: {}", request, e);
            throw new AppException("Failed to create tutorial");
        }
    }

    @Transactional
    public void uploadVideo(UUID tutorialId, MultipartFile videoFile) throws AppException {
        log.debug("Uploading video for tutorial with ID: {}", tutorialId);

        try {
            if (videoFile == null || videoFile.isEmpty()) {
                throw new InvalidInputException("Tutorial video is required");
            }

            Tutorial tutorial = findById(tutorialId);

            Video video = videoService.updateAndGetVideo(VideoType.TUTORIAL, tutorial.getId(), videoFile);
            tutorial.setVideo(video);

            tutorialRepository.save(tutorial);

            log.info("Uploaded video for tutorial with ID: {}", tutorialId);
        } catch (Exception e) {
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            log.error("Unexpected error while uploading video for tutorial: {}", tutorialId, e);
            throw new AppException("Failed to upload tutorial video");
        }
    }

    @Transactional
    public void uploadThumbnail(UUID tutorialId, MultipartFile thumbnailImageFile) throws AppException {
        log.debug("Uploading thumbnail for tutorial with ID: {}", tutorialId);

        try {
            if (thumbnailImageFile == null || thumbnailImageFile.isEmpty()) {
                throw new InvalidInputException("Tutorial thumbnail image is required");
            }

            Tutorial tutorial = findById(tutorialId);

            Image image = imageService.updateAndGetImage(ImageType.TUTORIAL, tutorial.getId(), thumbnailImageFile);
            tutorial.setThumbnail(image);

            tutorialRepository.save(tutorial);

            log.info("Uploaded thumbnail for tutorial with ID: {}", tutorialId);
        } catch (Exception e) {
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            log.error("Unexpected error while uploading thumbnail for tutorial: {}", tutorialId, e);
            throw new AppException("Failed to upload tutorial thumbnail");
        }
    }

    @Transactional
    public void update(UUID tutorialId, UpdateTutorialRequestDto request) throws AppException {
        log.debug("Updating tutorial with ID: {}", tutorialId);

        try {
            Tutorial tutorial = findById(tutorialId);

            tutorial.setTitle(request.title());
            tutorial.setDescription(request.description());
            tutorial.setCategory(request.category());

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
    public void deleteById(UUID tutorialId) throws AppException {
        log.debug("Deleting tutorial with ID: {}", tutorialId);

        try {
            Tutorial tutorial = findById(tutorialId);
            String videoKey = tutorial.getVideo() != null ? tutorial.getVideo().getVideoKey() : null;
            String imageKey = tutorial.getThumbnail() != null ? tutorial.getThumbnail().getImageKey() : null;

            tutorialRepository.delete(tutorial);

            if (videoKey != null) {
                eventPublisher.publishEvent(new VideoDeletedEvent(tutorialId, videoKey));
            }

            if (imageKey != null) {
                eventPublisher.publishEvent(new ImageDeletedEvent(tutorialId, imageKey));
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
