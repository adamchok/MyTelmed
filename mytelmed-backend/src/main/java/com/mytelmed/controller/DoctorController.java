package com.mytelmed.controller;

import com.mytelmed.model.dto.DoctorDto;
import com.mytelmed.model.dto.response.StandardResponseDto;
import com.mytelmed.model.entity.Doctor;
import com.mytelmed.service.DoctorService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;


@Slf4j
@RestController
@RequestMapping("/doctor")
public class DoctorController {
    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/list")
    public ResponseEntity<List<DoctorDto>> getAllDoctors() {
        List<DoctorDto> doctorDtoList = doctorService.getAllDoctors();
        return ResponseEntity.ok(doctorDtoList);
    }

    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/paginated")
    public ResponseEntity<Page<DoctorDto>> getAllDoctors(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<DoctorDto> doctorDtoPage = doctorService.getPaginatedDoctors(page, pageSize);
        return ResponseEntity.ok(doctorDtoPage);
    }

    @PreAuthorize("hasAuthority('admin')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StandardResponseDto> createDoctor(
            @Valid @RequestPart("doctor") DoctorDto doctorDto,
            @RequestPart("department") String departmentId,
            @RequestPart("facility") String facilityId,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {
        try {
            Optional<Doctor> createdDoctor = doctorService.createDoctorAccount(doctorDto, departmentId, facilityId,
                    imageFile);

            if (createdDoctor.isPresent()) {
                return ResponseEntity.ok(
                        StandardResponseDto.builder()
                                .isSuccess(true)
                                .message("Doctor account created successfully")
                                .build()
                );
            } else {
                return ResponseEntity.ok(
                        StandardResponseDto.builder()
                                .isSuccess(false)
                                .message("Failed to create doctor account")
                                .build()
                );
            }
        } catch (Exception e) {
            log.error("Failed to create doctor: {}", e.getMessage());
            return ResponseEntity.ok(
                    StandardResponseDto.builder()
                            .isSuccess(false)
                            .message("Failed to create doctor account")
                            .build()
            );
        }
    }

    @PreAuthorize("hasAnyAuthority('admin', 'doctor')")
    @PutMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StandardResponseDto> uploadImage(
            @RequestPart("doctor") String doctorId,
            @RequestPart(value = "image") MultipartFile imageFile) {
        try {
            Optional<Doctor> updatedDoctor = doctorService.uploadImage(doctorId, imageFile);

            if (updatedDoctor.isPresent()) {
                return ResponseEntity.ok(
                        StandardResponseDto.builder()
                                .isSuccess(true)
                                .message("Image uploaded successfully")
                                .build()
                );
            } else {
                return ResponseEntity.ok(
                        StandardResponseDto.builder()
                                .isSuccess(false)
                                .message("Failed to upload image")
                                .build()
                );
            }
        } catch (Exception e) {
            log.error("Failed to upload image: {}", e.getMessage());
            return ResponseEntity.ok(
                    StandardResponseDto.builder()
                            .isSuccess(false)
                            .message("Failed to upload image")
                            .build()
            );
        }
    }
}
