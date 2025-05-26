package com.mytelmed.core.image.controller;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.constants.ImageType;
import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.image.service.ImageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;


@Slf4j
@RestController
@RequestMapping("/api/v1/images")
public class ImageController {
    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> uploadImage(
            @RequestParam("imageType") ImageType imageType,
            @RequestParam("entityId") UUID entityId,
            @RequestParam("file") MultipartFile imageFile
    ) {
        log.info("Received request to upload {} image for entity: {}", imageType, entityId);

        if (imageFile == null || imageFile.isEmpty()) {
            throw new InvalidInputException("Image file not provided");
        }

        try {
            imageService.saveAndGetImage(imageType, entityId, imageFile);
            return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully"));
        } catch (Exception e) {
            throw new AppException("Failed to save image");
        }
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> updateImage(
            @RequestParam("imageType") ImageType imageType,
            @RequestParam("entityId") UUID entityId,
            @RequestParam("file") MultipartFile imageFile
    ) {
        log.info("Received request to update {} image for entity: {}", imageType, entityId);

        if (imageFile == null || imageFile.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Image file not provided"));
        }

        imageService.updateImage(imageType, entityId, imageFile);
        return ResponseEntity.ok(ApiResponse.success("Image updated successfully"));
    }

    @DeleteMapping("/{imageType}/{entityId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @PathVariable("imageType") ImageType imageType,
            @PathVariable("entityId") UUID entityId
    ) {
        log.info("Received request to delete {} image for entity: {}", imageType, entityId);

        imageService.deleteImage(imageType, entityId);
        return ResponseEntity.ok(ApiResponse.success("Image deleted successfully"));
    }
}
