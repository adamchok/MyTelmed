package com.mytelmed.core.facility.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.facility.dto.CreateFacilityRequestDto;
import com.mytelmed.core.facility.dto.FacilityDto;
import com.mytelmed.core.facility.dto.UpdateFacilityRequestDto;
import com.mytelmed.core.facility.mapper.FacilityMapper;
import com.mytelmed.core.facility.service.FacilityService;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Slf4j
@RestController
@RequestMapping("/api/v1/facility")
class FacilityController {
    private final FacilityService facilityService;
    private final AwsS3Service awsS3Service;
    private final FacilityMapper facilityMapper;

    FacilityController(FacilityMapper facilityMapper, AwsS3Service awsS3Service, FacilityService facilityService) {
        this.facilityMapper = facilityMapper;
        this.awsS3Service = awsS3Service;
        this.facilityService = facilityService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FacilityDto>>> getFacilities(
            @RequestParam(value = "page") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize
    ) {
        log.info("Received request to get facilities with page: {} and page size: {}", page, pageSize);

        Page<FacilityDto> paginatedFacilityDto = facilityService.findFacilities(page, pageSize)
                .map(facility -> facilityMapper.toDto(facility, awsS3Service));
        return ResponseEntity.ok(ApiResponse.success(paginatedFacilityDto));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<FacilityDto>>> getAllFacilities() {
        log.info("Received request to get all facilities");

        List<FacilityDto> paginatedFacilityDto = facilityService.findAllFacilities().stream()
                .map(facility -> facilityMapper.toDto(facility, awsS3Service))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(paginatedFacilityDto));
    }

    @GetMapping("/{facilityId}")
    public ResponseEntity<ApiResponse<FacilityDto>> getFacilityById(@PathVariable UUID facilityId) {
        log.info("Received request to get facility with ID: {}", facilityId);

        var facility = facilityService.findFacilityById(facilityId);
        FacilityDto facilityDto = facilityMapper.toDto(facility, awsS3Service);
        return ResponseEntity.ok(ApiResponse.success(facilityDto));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createFacility(@Valid @RequestBody CreateFacilityRequestDto request) {
        log.info("Received request to create facility with name: {}", request.name());

        facilityService.createFacility(request);
        return ResponseEntity.ok(ApiResponse.success("Facility created successfully"));
    }

    @PatchMapping("/{facilityId}")
    public ResponseEntity<ApiResponse<Void>> updateFacility(
            @PathVariable UUID facilityId,
            @Valid @RequestBody UpdateFacilityRequestDto request
    ) {
        log.info("Received request to update facility with ID: {}", facilityId);

        facilityService.updateFacility(facilityId, request);
        return ResponseEntity.ok(ApiResponse.success("Facility updated successfully"));
    }

    @DeleteMapping("/{facilityId}")
    public ResponseEntity<ApiResponse<Void>> deleteFacility(@PathVariable UUID facilityId) {
        log.info("Received request to delete facility with ID: {}", facilityId);

        facilityService.deleteFacility(facilityId);
        return ResponseEntity.ok(ApiResponse.success("Facility deleted successfully"));
    }

    @PostMapping(value = "/image/{facilityId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @PathVariable UUID facilityId
    ) {
        facilityService.uploadThumbnailImageByFacilityId(facilityId, file);
        return ResponseEntity.ok(ApiResponse.success("Thumbnail image uploaded successfully"));
    }
}
