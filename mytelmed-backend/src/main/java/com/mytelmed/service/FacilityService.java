package com.mytelmed.service;

import com.mytelmed.constant.EntityType;
import com.mytelmed.mapper.FacilityMapper;
import com.mytelmed.model.dto.FacilityDto;
import com.mytelmed.model.entity.Facility;
import com.mytelmed.model.entity.files.Image;
import com.mytelmed.repository.FacilityRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Service
public class FacilityService {
    private final ImageService imageService;
    private final FacilityRepository facilityRepository;
    private final FacilityMapper facilityMapper;

    public FacilityService(ImageService imageService, FacilityRepository facilityRepository, FacilityMapper facilityMapper) {
        this.imageService = imageService;
        this.facilityRepository = facilityRepository;
        this.facilityMapper = facilityMapper;
    }

    public List<FacilityDto> getAllFacilities() {
        List<Facility> facilities = facilityRepository.findAll();
        return facilities.stream().map(facilityMapper::toDto).toList();
    }

    public Page<FacilityDto> getAllFacilities(int page, int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<Facility> facilities = facilityRepository.findAll(pageable);
        return facilities.map(facilityMapper::toDto);
    }

    public FacilityDto createFacility(FacilityDto facilityDto) {
        Facility facility = facilityMapper.toEntity(facilityDto);
        facility = facilityRepository.save(facility);
        return facilityMapper.toDto(facility);
    }

    public FacilityDto uploadImage(String facilityId, MultipartFile imageFile) {
        Optional<Facility> facilityOpt = facilityRepository.findById(UUID.fromString(facilityId));
        if (facilityOpt.isEmpty()) {
            throw new RuntimeException("Facility not found");
        }
        Facility facility = facilityOpt.get();
        Optional<Image> image = imageService.saveImage(EntityType.FACILITY, facility.getId(), imageFile, true);
        if (image.isEmpty()) {
            throw new RuntimeException("Failed to save image");
        }
        facility.setImage(image.get());
        Facility updatedFacility = facilityRepository.save(facility);
        return facilityMapper.toDto(updatedFacility);
    }
}