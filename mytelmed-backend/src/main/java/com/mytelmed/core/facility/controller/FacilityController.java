package com.mytelmed.core.facility.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.facility.dto.FacilityDto;
import com.mytelmed.core.facility.mapper.FacilityMapper;
import com.mytelmed.core.facility.service.FacilityService;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;


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
    public ResponseEntity<ApiResponse<Page<FacilityDto>>> getAllFacilities(
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize
    ) {
        log.info("Received request to get all facilities with page: {} and page size: {}", page, pageSize);

        Page<FacilityDto> paginatedFacilityDto = facilityService.findAllFacilities(page, pageSize)
                .map(facility -> facilityMapper.toDto(facility, awsS3Service));
        return ResponseEntity.ok(ApiResponse.success(paginatedFacilityDto));
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
