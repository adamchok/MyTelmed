package com.mytelmed.core.facility.controller;

import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.facility.dto.FacilityDto;
import com.mytelmed.core.facility.entity.Facility;
import com.mytelmed.core.facility.mapper.FacilityMapper;
import com.mytelmed.core.facility.service.FacilityService;
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
import java.util.Optional;
import java.util.UUID;


@RestController
@RequestMapping("/api/v1/facility")
class FacilityController {
    private final FacilityService facilityService;
    private final FacilityMapper facilityMapper;

    FacilityController(FacilityMapper facilityMapper, FacilityService facilityService) {
        this.facilityMapper = facilityMapper;
        this.facilityService = facilityService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FacilityDto>>> getAllFacilities(
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize
    ) {
        Page<FacilityDto> paginatedFacilityDto = facilityService.findAllFacilities(page, pageSize).map(facilityMapper::toDto);
        return ResponseEntity.ok(ApiResponse.success(paginatedFacilityDto));
    }

    @PostMapping(value = "/image/{facilityId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @PathVariable UUID facilityId
    ) {
        if (file == null || file.isEmpty()) {
            throw new InvalidInputException("Upload failed due to empty or missing file");
        }

        Optional<Facility> facility = facilityService.uploadThumbnailImageByFacilityId(facilityId, file);
        return facility
                .map(f -> ResponseEntity.ok(ApiResponse.success("Thumbnail image uploaded successfully")))
                .orElseGet(() -> ResponseEntity.internalServerError().body(ApiResponse.failure("Failed to upload thumbnail image")));
    }
}
