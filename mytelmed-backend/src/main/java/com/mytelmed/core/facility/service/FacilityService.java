package com.mytelmed.core.facility.service;

import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constants.ImageType;
import com.mytelmed.core.facility.entity.Facility;
import com.mytelmed.core.facility.repository.FacilityRepository;
import com.mytelmed.core.image.entity.Image;
import com.mytelmed.core.image.service.ImageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Slf4j
@Service
public class FacilityService {
    private final FacilityRepository facilityRepository;
    private final ImageService imageService;

    public FacilityService(FacilityRepository facilityRepository, ImageService imageService) {
        this.facilityRepository = facilityRepository;
        this.imageService = imageService;
    }

    public List<Facility> findAllFacilities() {
        log.debug("Fetching all facilities");
        return facilityRepository.findAll();
    }

    public Page<Facility> findAllFacilities(int page, int pageSize) {
        log.debug("Fetching all facilities by page {} and page size {}", page, pageSize);
        Pageable pageable = PageRequest.of(page, pageSize);
        return facilityRepository.findAll(pageable);
    }

    public Facility findFacilityById(UUID facilityId) throws ResourceNotFoundException {
        log.debug("Retrieving facility with ID: {}", facilityId);
        return facilityRepository.findById(facilityId)
                .orElseThrow(() -> {
                    log.warn("Facility not found with ID: {}", facilityId);
                    return new ResourceNotFoundException("Facility not found");
                });
    }

    public Optional<Facility> uploadThumbnailImageByFacilityId(UUID facilityId, MultipartFile file) {
        log.debug("Uploading thumbnail image for facility with ID: {}", facilityId);
        try {
            Facility facility = findFacilityById(facilityId);

            Image image = imageService.saveAndGetImage(ImageType.FACILITY, facility.getId(), file);
            facility.setThumbnailImage(image);
            facilityRepository.save(facility);

            log.info("Uploaded thumbnail image for facility with ID: {}", facilityId);
            return Optional.of(facility);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to upload thumbnail image for facility with ID: {}", facilityId, e);
        }
        return Optional.empty();
    }
}
