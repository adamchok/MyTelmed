package com.mytelmed.core.pharmacist.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.pharmacist.dto.CreatePharmacistRequestDto;
import com.mytelmed.core.pharmacist.dto.PharmacistDto;
import com.mytelmed.core.pharmacist.dto.UpdatePharmacistFacilityRequestDto;
import com.mytelmed.core.pharmacist.dto.UpdatePharmacistProfileRequestDto;
import com.mytelmed.core.pharmacist.entity.Pharmacist;
import com.mytelmed.core.pharmacist.mapper.PharmacistMapper;
import com.mytelmed.core.pharmacist.service.PharmacistService;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
@RequestMapping("/api/v1/pharmacist")
public class PharmacistController {
    private final PharmacistMapper pharmacistMapper;
    private final AwsS3Service awsS3Service;
    private final PharmacistService pharmacistService;

    public PharmacistController(PharmacistMapper pharmacistMapper, AwsS3Service awsS3Service, PharmacistService pharmacistService) {
        this.pharmacistMapper = pharmacistMapper;
        this.awsS3Service = awsS3Service;
        this.pharmacistService = pharmacistService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<PharmacistDto>>> getAllPharmacists(
            @RequestParam Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        log.info("Received request to get all pharmacists with page: {} and page size: {}", page, pageSize);

        Page<Pharmacist> paginatedPharmacist = pharmacistService.findAll(page, pageSize);
        Page<PharmacistDto> paginatedPharmacistDto = paginatedPharmacist
                .map(pharmacist -> pharmacistMapper.toDto(pharmacist, awsS3Service));
        return ResponseEntity.ok(ApiResponse.success(paginatedPharmacistDto));
    }

    @GetMapping("/{pharmacistId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PharmacistDto>> getPharmacistById(@PathVariable UUID pharmacistId) {
        log.info("Received request to get pharmacist with ID: {}", pharmacistId);

        Pharmacist pharmacist = pharmacistService.findById(pharmacistId);
        PharmacistDto pharmacistDto = pharmacistMapper.toDto(pharmacist, awsS3Service);
        return ResponseEntity.ok(ApiResponse.success(pharmacistDto));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('PHARMACIST')")
    public ResponseEntity<ApiResponse<PharmacistDto>> getPharmacistProfile(@AuthenticationPrincipal Account account) {
        log.info("Received request to get pharmacist profile for account with ID: {}", account.getId());

        Pharmacist pharmacist = pharmacistService.findByAccount(account);
        PharmacistDto pharmacistDto = pharmacistMapper.toDto(pharmacist, awsS3Service);
        return ResponseEntity.ok(ApiResponse.success(pharmacistDto));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PharmacistDto>> createPharmacist(
            @Valid @RequestBody CreatePharmacistRequestDto request) {
        log.info("Received request to create pharmacist with request: {}", request);

        Pharmacist pharmacist = pharmacistService.create(request);
        PharmacistDto pharmacistDto = pharmacistMapper.toDto(pharmacist, awsS3Service);
        return ResponseEntity.ok(ApiResponse.success(pharmacistDto, "Pharmacist created successfully"));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('PHARMACIST')")
    public ResponseEntity<ApiResponse<Void>> updatePharmacistProfile(
            @Valid @RequestBody UpdatePharmacistProfileRequestDto request,
            @AuthenticationPrincipal Account account) {
        log.info("Received request to update pharmacist profile for account with ID: {}", account.getId());

        pharmacistService.updateByAccount(account, request);
        return ResponseEntity.ok(ApiResponse.success("Pharmacist profile updated successfully"));
    }

    @PutMapping(value = "/profile/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PHARMACIST')")
    public ResponseEntity<ApiResponse<Void>> updatePharmacistProfileImage(
            @RequestPart(value = "profileImage") MultipartFile profileImage,
            @AuthenticationPrincipal Account account) {
        log.info("Received request to update pharmacist profile image for account with ID: {}", account.getId());

        pharmacistService.updateProfileImageByAccount(account, profileImage);
        return ResponseEntity.ok(ApiResponse.success("Pharmacist profile image updated successfully"));
    }

    @PatchMapping("/{pharmacistId}/facility")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updatePharmacistFacility(
            @PathVariable UUID pharmacistId,
            @Valid @RequestBody UpdatePharmacistFacilityRequestDto request) {
        log.info("Received request to update pharmacist facility for pharmacist with ID: {}", pharmacistId);

        pharmacistService.updateFacilityById(pharmacistId, request);
        return ResponseEntity.ok(ApiResponse.success("Pharmacist facility updated successfully"));
    }

    @DeleteMapping("/{pharmacistId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePharmacist(@PathVariable UUID pharmacistId) {
        log.info("Received request to delete pharmacist with ID: {}", pharmacistId);

        pharmacistService.deleteById(pharmacistId);
        return ResponseEntity.ok(ApiResponse.success("Pharmacist deleted successfully"));
    }

    @PostMapping("/activate/{pharmacistId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> activatePharmacistById(@PathVariable UUID pharmacistId) {
        log.info("Received request to activate pharmacist with ID: {}", pharmacistId);

        pharmacistService.activateById(pharmacistId);
        return ResponseEntity.ok(ApiResponse.success("Pharmacist account activated successfully"));
    }

    @PostMapping("/deactivate/{pharmacistId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivatePharmacistById(@PathVariable UUID pharmacistId) {
        log.info("Received request to deactivate pharmacist with ID: {}", pharmacistId);

        pharmacistService.deactivateById(pharmacistId);
        return ResponseEntity.ok(ApiResponse.success("Pharmacist account deactivated successfully"));
    }

    @PostMapping("/reset/password/{pharmacistId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> resetPharmacistAccountPassword(@PathVariable UUID pharmacistId) {
        log.info("Received request to reset pharmacist account password for pharmacist with ID: {}", pharmacistId);

        pharmacistService.resetAccountPassword(pharmacistId);
        return ResponseEntity.ok(ApiResponse.success("Pharmacist account password reset successfully"));
    }

    @PatchMapping(value = "/{pharmacistId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> uploadPharmacistImage(
            @PathVariable UUID pharmacistId,
            @RequestPart(value = "profileImage") MultipartFile profileImage) {
        log.info("Received request to upload image for pharmacist with ID: {}", pharmacistId);

        pharmacistService.uploadProfileImageById(pharmacistId, profileImage);
        return ResponseEntity.ok(ApiResponse.success("Pharmacist image uploaded successfully"));
    }
}
