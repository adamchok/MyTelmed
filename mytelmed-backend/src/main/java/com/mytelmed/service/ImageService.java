package com.mytelmed.service;

import com.mytelmed.constant.EntityType;
import com.mytelmed.repository.ImageRepository;
import com.mytelmed.service.aws.AwsS3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.mytelmed.model.entity.files.Image;
import org.springframework.web.multipart.MultipartFile;
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

    public Optional<Image> saveImage(EntityType entityType, UUID entityId, MultipartFile imageFile, boolean isPublic) {
        try {
            String imageUrl = awsS3Service.saveFileToS3AndGetUrl(entityType.name(), entityId.toString(),
                    imageFile, isPublic);
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

    public Optional<Image> updateImage(EntityType entityType, UUID entityId, MultipartFile imageFile,
                                       boolean isPublic) {
        try {
            Image image = imageRepository.findByEntityTypeAndEntityId(entityType, entityId)
                    .orElseThrow(() -> new RuntimeException(
                            "Image not found with entity type and entity ID: " + entityType.name() + ", " + entityId.toString()));

            String oldImageUrl = image.getImageUrl();
            String newImageUrl = awsS3Service.updateFileInS3(entityType.name(), entityId.toString(), oldImageUrl,
                    imageFile, isPublic);
            image.setImageUrl(newImageUrl);

            return Optional.of(imageRepository.save(image));
        } catch (Exception e) {
            log.error("Error updating image: {}", e.getMessage(), e);
        }
        return Optional.empty();
    }

    public void deleteImageByEntityTypeAndId(EntityType entityType, UUID entityId, boolean isPublic) {
        try {
            Image image = imageRepository.findByEntityTypeAndEntityId(entityType, entityId)
                    .orElseThrow(() -> new RuntimeException(
                            "Image not found with entity type and entity ID: " + entityType.name() + ", " + entityId.toString()));

            awsS3Service.deleteFileInS3ByUrl(image.getImageUrl(), isPublic);
            imageRepository.delete(image);
        } catch (Exception e) {
            log.error("Error updating document: {}", e.getMessage(), e);
        }
    }
}
