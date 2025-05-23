package com.mytelmed.core.image.service;

import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constants.ImageType;
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

    @Transactional
    public Optional<Image> saveImage(ImageType imageType, UUID entityId, MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) {
            log.warn("Attempted to save empty or null image file for entity: {}", entityId);
            return Optional.empty();
        }

        String imageKey = null;

        try {
            S3StorageOptions storageOptions = S3StorageOptions.builder()
                    .folderName(imageType.name().toLowerCase())
                    .entityId(entityId.toString())
                    .publicAccess(true)
                    .build();

            log.debug("Uploading image for entity: {} of type: {}", entityId, imageType);
            imageKey = awsS3Service.uploadFileAndGetKey(storageOptions, imageFile);
            String imageUrl = awsS3Service.getFileUrl(imageKey, true, null);

            Image image = Image.builder()
                    .imageKey(imageKey)
                    .imageType(imageType)
                    .entityId(entityId)
                    .imageUrl(imageUrl)
                    .build();

            log.debug("Saving image metadata to database for entity: {}", entityId);
            return Optional.of(imageRepository.save(image));
        }  catch (IOException e) {
            log.error("Failed to read image file data for entity: {}", entityId, e);
            return Optional.empty();
        } catch (S3Exception e) {
            log.error("AWS S3 error while saving image for entity: {}", entityId, e);
            return Optional.empty();
        } catch (Exception e) {
            log.error("Unexpected error while saving image for entity: {}", entityId, e);

            if (imageKey != null) {
                try {
                    log.info("Rolling back S3 upload for entity: {} due to database failure", entityId);
                    awsS3Service.deleteFile(imageKey, true);
                } catch (Exception rollbackEx) {
                    log.error("Failed to roll back S3 upload for entity: {} (key: {})",
                            entityId, imageKey, rollbackEx);
                }
            }

            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return Optional.empty();
        }
    }

    @Transactional
    public Optional<Image> updateImage(ImageType imageType, UUID entityId, MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) {
            log.warn("Attempted to update empty or null image file for entity: {}", entityId);
            return Optional.empty();
        }

        try {
            Image existingImage = imageRepository.findByImageTypeAndEntityId(imageType, entityId)
                    .orElseThrow(() -> new ResourceNotFoundException("Image not found"));

            log.debug("Updating image for entity: {} of type: {}", entityId, imageType);
            String imageKey = awsS3Service.updateFile(existingImage.getImageKey(), true, imageFile);
            existingImage.setImageKey(imageKey);
            existingImage.setImageUrl(imageKey);

            log.debug("Updating image metadata to database for entity: {}", entityId);
            return Optional.of(imageRepository.save(existingImage));
        } catch (IOException e) {
            log.error("Failed to read image file data for entity: {}", entityId, e);
            return Optional.empty();
        } catch (S3Exception e) {
            log.error("AWS S3 error while updating image for entity: {}", entityId, e);
            return Optional.empty();
        } catch (Exception e) {
            log.error("Unexpected error while updating image for entity: {}", entityId, e);
            return Optional.empty();
        }
    }

    @Transactional
    public boolean deleteImage(ImageType imageType, UUID entityId) {
        try {
            Image image = imageRepository.findByImageTypeAndEntityId(imageType, entityId)
                    .orElseThrow(() -> new ResourceNotFoundException("Image not found"));

            awsS3Service.deleteFile(image.getImageKey(), true);
            imageRepository.delete(image);
            return true;
        } catch (S3Exception e) {
            log.error("AWS S3 error while deleting image for entity: {}", entityId, e);
            return false;
        } catch (Exception e) {
            log.error("Unexpected error while deleting image for entity: {}", entityId, e);
            return false;
        }
    }
}
