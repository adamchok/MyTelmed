package com.mytelmed.service;

import com.mytelmed.constant.EntityType;
import com.mytelmed.repository.ImageRepository;
import com.mytelmed.service.aws.AwsPublicS3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.mytelmed.model.entity.Image;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Slf4j
@Service
public class ImageService {
    private final ImageRepository imageRepository;
    private final AwsPublicS3Service awsPublicS3Service;

    public ImageService(ImageRepository imageRepository, AwsPublicS3Service awsPublicS3Service) {
        this.imageRepository = imageRepository;
        this.awsPublicS3Service = awsPublicS3Service;
    }

    public Optional<Image> saveImage(EntityType entityType, UUID entityId, MultipartFile imageFile) {
        try {
            String imageUrl = awsPublicS3Service.saveFileToS3AndGetUrl(entityType.name(), entityId.toString(), imageFile);
            Image image = Image.builder()
                    .imageUrl(imageUrl)
                    .entityType(entityType)
                    .entityId(entityId)
                    .build();
            return Optional.of(imageRepository.save(image));
        } catch (Exception e) {
            log.error("Error creating image: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public Optional<Image> updateImage(EntityType entityType, UUID entityId, MultipartFile imageFile) {
        try {
            Optional<Image> existingImageOpt = imageRepository.findByEntityTypeAndEntityId(entityType, entityId);

            if (existingImageOpt.isEmpty()) {
                throw new RuntimeException("Image not found with entity type and entity ID: " + entityType.name()
                        + ", " + entityId.toString());
            }

            Image existingImage = existingImageOpt.get();
            String oldImageUrl = existingImage.getImageUrl();
            String newImageUrl = awsPublicS3Service.updateImageInS3(entityType.name(), entityId.toString(), oldImageUrl,
                    imageFile);
            existingImage.setImageUrl(newImageUrl);

            return Optional.of(imageRepository.save(existingImage));
        } catch (Exception e) {
            log.error("Error updating image: {}", e.getMessage(), e);
        }
        return Optional.empty();
    }

    public void deleteImageByEntityTypeAndId(EntityType entityType, UUID entityId) {
        Optional<Image> existingImageOpt = imageRepository.findByEntityTypeAndEntityId(entityType, entityId);

        if (existingImageOpt.isEmpty()) {
            throw new RuntimeException("Image not found with entity type and entity ID: " + entityType.name()
                    + ", " + entityId.toString());
        }

        Image existingImage = existingImageOpt.get();
        awsPublicS3Service.deleteImageInS3ByImageUrl(existingImage.getImageUrl());
        imageRepository.delete(existingImage);
    }
}
