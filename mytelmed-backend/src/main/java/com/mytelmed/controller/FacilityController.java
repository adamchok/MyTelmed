package com.mytelmed.controller;

import com.mytelmed.model.dto.FacilityDto;
import com.mytelmed.service.FacilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;


@RestController
@RequestMapping("/facility")
public class FacilityController {
    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @PreAuthorize("hasAnyAuthority('admin', 'patient')")
    @GetMapping("/paginated")
    public ResponseEntity<Page<FacilityDto>> getAllFacilities(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<FacilityDto> facilities = facilityService.getAllFacilities(page, pageSize);
        return ResponseEntity.ok(facilities);
    }

    @PreAuthorize("hasAuthority('admin')")
    @PostMapping
    public ResponseEntity<FacilityDto> createFacility(@RequestBody FacilityDto facilityDto) {
        FacilityDto createdFacility = facilityService.createFacility(facilityDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFacility);
    }

    @PreAuthorize("hasAuthority('admin')")
    @PostMapping("/{id}/image")
    public ResponseEntity<FacilityDto> uploadImageForFacility(
            @PathVariable("id") String facilityId,
            @RequestPart("image") MultipartFile imageFile) {
        FacilityDto updatedFacility = facilityService.uploadImage(facilityId, imageFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(updatedFacility);
    }
}