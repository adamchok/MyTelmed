package com.mytelmed.core.speciality.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.speciality.dto.SpecialityDto;
import com.mytelmed.core.speciality.entity.Speciality;
import com.mytelmed.core.speciality.mapper.SpecialityMapper;
import com.mytelmed.core.speciality.service.SpecialityService;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/api/v1/speciality")
public class SpecialityController {
    private final SpecialityService specialityService;
    private final AwsS3Service awsS3Service;
    private final SpecialityMapper specialityMapper;

    public SpecialityController(SpecialityService specialityService, AwsS3Service awsS3Service, SpecialityMapper specialityMapper) {
        this.specialityService = specialityService;
        this.awsS3Service = awsS3Service;
        this.specialityMapper = specialityMapper;
    }

    @GetMapping("/{specialityName}")
    public ResponseEntity<ApiResponse<SpecialityDto>> getSpecialityByName(
            @PathVariable("specialityName") String specialityName
    ) {
        Speciality speciality = specialityService.findSpecialityByName(specialityName);
        return ResponseEntity.ok(ApiResponse.success(specialityMapper.toDto(speciality, awsS3Service)));
    }

    @PostMapping(value = "/image/{specialityName}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> uploadThumbnailImageBySpecialityName(
            @RequestParam("file") MultipartFile file,
            @PathVariable String specialityName
    ) {
        specialityService.uploadThumbnailImageBySpecialityName(specialityName, file);
        return ResponseEntity.ok(ApiResponse.success("Thumbnail image uploaded successfully"));
    }
}
