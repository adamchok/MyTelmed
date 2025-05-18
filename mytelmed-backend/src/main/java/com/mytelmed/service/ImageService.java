package com.mytelmed.service;

import com.mytelmed.constant.EntityType;
import com.mytelmed.repository.ImageRepository;
import com.mytelmed.service.aws.AwsPublicS3Service;
import com.mytelmed.utils.AesEncryptionUtil;
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
                    .isDeleted(false)
                    .build();
            return Optional.of(imageRepository.save(image));
        } catch (Exception e) {
            log.error("Error creating image: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public Optional<Image> findImageByEntityTypeAndId(EntityType entityType, UUID entityId) {
        return imageRepository.findByEntityTypeAndEntityIdAndIsDeletedFalse(entityType, entityId);
    }

    public List<Image> findAllImages() {
        return imageRepository.findAll();
    }

    public void deleteImage(UUID imageId) {
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));
        image.setDeleted(true);
        imageRepository.save(image);
    }
}
