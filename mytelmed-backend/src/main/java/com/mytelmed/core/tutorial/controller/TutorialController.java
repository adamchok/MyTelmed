package com.mytelmed.core.tutorial.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.tutorial.dto.CreateTutorialRequestDto;
import com.mytelmed.core.tutorial.dto.TutorialDto;
import com.mytelmed.core.tutorial.dto.UpdateTutorialRequestDto;
import com.mytelmed.core.tutorial.entity.Tutorial;
import com.mytelmed.core.tutorial.mapper.TutorialMapper;
import com.mytelmed.core.tutorial.service.TutorialService;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;


@Slf4j
@RestController
@RequestMapping("/api/v1/tutorial")
public class TutorialController {
    private final TutorialService tutorialService;
    private final AwsS3Service awsS3Service;
    private final TutorialMapper tutorialMapper;

    public TutorialController(TutorialService tutorialService, AwsS3Service awsS3Service, TutorialMapper tutorialMapper) {
        this.awsS3Service = awsS3Service;
        this.tutorialMapper = tutorialMapper;
        this.tutorialService = tutorialService;
    }

    @GetMapping("/{tutorialId}")
    public ResponseEntity<ApiResponse<TutorialDto>> getTutorialById(@PathVariable UUID tutorialId) {
        log.info("Received request to get tutorial with ID: {}", tutorialId);

        Tutorial tutorial = tutorialService.findById(tutorialId);
        TutorialDto tutorialDto = tutorialMapper.toDto(tutorial, awsS3Service);
        return ResponseEntity.ok(ApiResponse.success(tutorialDto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TutorialDto>>> getTutorialsByCategory(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Received request to get tutorials by category: {}, page: {}, size: {}", category, page, size);

        Page<Tutorial> tutorialPage = tutorialService.findByCategory(category, page, size);
        Page<TutorialDto> tutorialDtoPage = tutorialPage
                .map((tutorial) -> tutorialMapper.toDto(tutorial, awsS3Service));
        return ResponseEntity.ok(ApiResponse.success(tutorialDtoPage));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TutorialDto>> createTutorial(
            @Valid @RequestBody CreateTutorialRequestDto request) {
        log.info("Received request to create tutorial with title: {}", request.title());

        Tutorial tutorial = tutorialService.create(request);
        TutorialDto tutorialDto = tutorialMapper.toDto(tutorial, awsS3Service);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(tutorialDto, "Tutorial created successfully"));
    }

    @PostMapping(value = "/{tutorialId}/video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> uploadTutorialVideo(
            @PathVariable UUID tutorialId,
            @RequestPart("video") MultipartFile videoFile) {
        log.info("Received request to upload video for tutorial with ID: {}", tutorialId);

        tutorialService.uploadVideo(tutorialId, videoFile);
        return ResponseEntity.ok(ApiResponse.success("Tutorial video uploaded successfully"));
    }

    @PostMapping(value = "/{tutorialId}/thumbnail", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> uploadTutorialThumbnail(
            @PathVariable UUID tutorialId,
            @RequestPart("thumbnail") MultipartFile thumbnailFile) {
        log.info("Received request to upload thumbnail for tutorial with ID: {}", tutorialId);

        tutorialService.uploadThumbnail(tutorialId, thumbnailFile);
        return ResponseEntity.ok(ApiResponse.success("Tutorial thumbnail uploaded successfully"));
    }

    @PutMapping("/{tutorialId}")
    public ResponseEntity<ApiResponse<Void>> updateTutorial(
            @PathVariable UUID tutorialId,
            @Valid @RequestBody UpdateTutorialRequestDto request) {
        log.info("Received request to update tutorial with ID: {}", tutorialId);

        tutorialService.update(tutorialId, request);
        return ResponseEntity.ok(ApiResponse.success("Tutorial updated successfully"));
    }

    @DeleteMapping("/{tutorialId}")
    public ResponseEntity<ApiResponse<Void>> deleteTutorial(@PathVariable UUID tutorialId) {
        log.info("Received request to delete tutorial with ID: {}", tutorialId);

        tutorialService.deleteById(tutorialId);
        return ResponseEntity.ok(ApiResponse.success("Tutorial deleted successfully"));
    }
}
