package com.mytelmed.core.image.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.file.FileType;
import com.mytelmed.common.constant.file.ImageType;
import com.mytelmed.core.image.entity.Image;
import com.mytelmed.core.image.repository.ImageRepository;
import com.mytelmed.infrastructure.aws.dto.S3StorageOptions;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import lombok.extern.slf4j.Slf4j;
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
public class ImageService {
    private final ImageRepository imageRepository;
    private final AwsS3Service awsS3Service;

    public ImageService(ImageRepository imageRepository, AwsS3Service awsS3Service) {
        this.imageRepository = imageRepository;
        this.awsS3Service = awsS3Service;
    }

    @Transactional(readOnly = true)
    public Image getImageById(UUID id) throws ResourceNotFoundException {
        log.debug("Fetching image with ID: {}", id);

        Image image = imageRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Image not found with ID: {}", id);
                    return new ResourceNotFoundException("Image not found");
                });

        log.info("Found image with ID: {}", id);
        return image;
    }

    @Transactional
    public Image updateAndGetImage(ImageType imageType, UUID entityId, MultipartFile imageFile) throws AppException {
        if (imageFile == null || imageFile.isEmpty()) {
            log.warn("Attempted to update empty or null image file for entity: {}", entityId);
            throw new InvalidInputException("Image file cannot be empty");
        }

        try {
            Optional<Image> imageOpt = imageRepository.findByImageTypeAndEntityId(imageType, entityId);

            if (imageOpt.isEmpty()) {
                return saveAndGetImage(imageType, entityId, imageFile);
            }

            Image image = imageOpt.get();

            log.debug("Updating image for entity: {} of type: {}", entityId, imageType);
            String imageKey = awsS3Service.updateFile(image.getImageKey(), imageFile);
            image.setImageKey(imageKey);

            log.debug("Updating image metadata to database for entity: {}", entityId);
            image = imageRepository.save(image);

            log.info("Updated image metadata to database for entity: {}", entityId);

            return image;
        } catch (IOException e) {
            log.error("Failed to read image file data for entity: {}", entityId, e);
            throw new InvalidInputException("Failed to read image file");
        } catch (S3Exception e) {
            log.error("AWS S3 error while updating image for entity: {}", entityId, e);
            throw new AppException("Failed to update image");
        } catch (Exception e) {
            log.error("Unexpected error while updating image for entity: {}", entityId, e);
            throw new AppException("Failed to update image");
        }
    }

    @Transactional
    protected Image saveAndGetImage(ImageType imageType, UUID entityId, MultipartFile imageFile)
            throws IOException, S3Exception, AppException {
        String imageKey = null;

        if (imageFile == null || imageFile.isEmpty()) {
            log.warn("Attempted to save empty or null image file for entity: {}", entityId);
            throw new InvalidInputException("Image file cannot be empty");
        }

        try {
            S3StorageOptions storageOptions = S3StorageOptions.builder()
                    .fileType(FileType.IMAGE)
                    .folderName(imageType.name().toLowerCase())
                    .entityId(entityId.toString())
                    .build();

            log.debug("Uploading image for entity: {} of type: {}", entityId, imageType);
            imageKey = awsS3Service.uploadFileAndGetKey(storageOptions, imageFile);

            Image image = Image.builder()
                    .imageKey(imageKey)
                    .imageType(imageType)
                    .entityId(entityId)
                    .build();

            image = imageRepository.save(image);
            log.info("Saved image to database for entity: {}", entityId);
            return image;
        } catch (IOException | S3Exception e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while saving image for entity: {}", entityId, e);

            if (imageKey != null) {
                try {
                    log.info("Rolling back S3 upload for entity: {} due to database failure", entityId);
                    awsS3Service.deleteFile(imageKey);
                } catch (Exception rollbackEx) {
                    log.error("Failed to roll back S3 upload for entity: {} (key: {})", entityId, imageKey, rollbackEx);
                }
            }

            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            throw e;
        }
    }
}
