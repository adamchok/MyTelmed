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
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
@RequestMapping("/api/v1/pharmacist")
public class PharmacistController {
    private final PharmacistMapper pharmacistMapper;
    private final PharmacistService pharmacistService;

    public PharmacistController(PharmacistMapper pharmacistMapper, PharmacistService pharmacistService) {
        this.pharmacistMapper = pharmacistMapper;
        this.pharmacistService = pharmacistService;
    }

    @GetMapping("/{pharmacistId}")
    public ResponseEntity<ApiResponse<PharmacistDto>> getPharmacistById(@PathVariable UUID pharmacistId) {
        Pharmacist pharmacist = pharmacistService.findPharmacistById(pharmacistId);
        PharmacistDto pharmacistDto = pharmacistMapper.toDto(pharmacist);
        return ResponseEntity.ok(ApiResponse.success(pharmacistDto));
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<ApiResponse<PharmacistDto>> getPharmacistByAccountId(@PathVariable UUID accountId) {
        Pharmacist pharmacist = pharmacistService.findPharmacistByAccountId(accountId);
        PharmacistDto pharmacistDto = pharmacistMapper.toDto(pharmacist);
        return ResponseEntity.ok(ApiResponse.success(pharmacistDto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PharmacistDto>>> getPaginatedPharmacists(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PharmacistDto> doctorDtoPage = pharmacistService.findAllPaginatedPharmacists(page, size)
                .map(pharmacistMapper::toDto);
        return ResponseEntity.ok(ApiResponse.success(doctorDtoPage));
    }

    @GetMapping("/facility/{facilityId}")
    public ResponseEntity<ApiResponse<Page<PharmacistDto>>> getPaginatedPharmacistsByFacilityId(
            @PathVariable UUID facilityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PharmacistDto> doctorDtoPage = pharmacistService.findAllPaginatedPharmacistsByFacilityId(facilityId, page, size)
                .map(pharmacistMapper::toDto);
        return ResponseEntity.ok(ApiResponse.success(doctorDtoPage));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> createPharmacist(
            @RequestPart("pharmacist") CreatePharmacistRequestDto request,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        pharmacistService.createPharmacist(request, profileImage);
        return ResponseEntity.ok(ApiResponse.success("Pharmacist created successfully"));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> updatePharmacistProfile(
            @RequestBody UpdatePharmacistProfileRequestDto request,
            @AuthenticationPrincipal Account account) {
        pharmacistService.updatePharmacistProfileByAccountId(account.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully"));
    }

    @PutMapping(value = "/profile/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> uploadPharmacistProfileImage(
            @RequestPart(value = "profileImage") MultipartFile profileImage,
            @AuthenticationPrincipal Account account) {
        pharmacistService.updatePharmacistProfileImageByAccountId(account.getId(), profileImage);
        return ResponseEntity.ok(ApiResponse.success("Pharmacist profile image updated successfully"));
    }

    @PutMapping("/{pharmacistId}/specialities-facility")
    public ResponseEntity<ApiResponse<Void>> updatePharmacistFacility(
            @PathVariable UUID pharmacistId,
            @RequestBody UpdatePharmacistFacilityRequestDto request) {
        pharmacistService.updatePharmacistFacilityByPharmacistId(pharmacistId, request);
        return ResponseEntity.ok(ApiResponse.success("Pharmacist specialities and facility updated successfully"));
    }

    @DeleteMapping("/{pharmacistId}")
    public ResponseEntity<ApiResponse<Void>> deletePharmacistById(@PathVariable UUID pharmacistId) {
        pharmacistService.deletePharmacistById(pharmacistId);
        return ResponseEntity.ok(ApiResponse.success("Pharmacist deleted successfully"));
    }
}