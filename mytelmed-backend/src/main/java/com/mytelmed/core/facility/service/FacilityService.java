package com.mytelmed.core.facility.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.file.ImageType;
import com.mytelmed.core.facility.dto.CreateFacilityRequestDto;
import com.mytelmed.core.facility.dto.UpdateFacilityRequestDto;
import com.mytelmed.core.facility.entity.Facility;
import com.mytelmed.core.facility.mapper.FacilityMapper;
import com.mytelmed.core.facility.repository.FacilityRepository;
import com.mytelmed.core.image.entity.Image;
import com.mytelmed.core.image.service.ImageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;


@Slf4j
@Service
public class FacilityService {
    private final FacilityRepository facilityRepository;
    private final ImageService imageService;
    private final FacilityMapper facilityMapper;

    public FacilityService(FacilityRepository facilityRepository, ImageService imageService, FacilityMapper facilityMapper) {
        this.facilityRepository = facilityRepository;
        this.imageService = imageService;
        this.facilityMapper = facilityMapper;
    }

    @Transactional(readOnly = true)
    public Page<Facility> findFacilities(int page, int pageSize) throws AppException {
        log.debug("Fetching all facilities by page {} and page size {}", page, pageSize);

        try {
            Pageable pageable = PageRequest.of(page, pageSize);
            return facilityRepository.findAll(pageable);
        } catch (Exception e) {
            log.error("Failed to fetch all facilities with page {} and page size {}", page, pageSize, e);
            throw new AppException("Failed to fetch facility entries");
        }
    }

    @Transactional(readOnly = true)
    public List<Facility> findAllFacilities() throws AppException {
        log.debug("Fetching all facilities");

        try {
            return facilityRepository.findAll();
        } catch (Exception e) {
            log.error("Failed to fetch all facilities", e);
            throw new AppException("Failed to fetch facility entries");
        }
    }

    @Transactional(readOnly = true)
    public Facility findFacilityById(UUID facilityId) throws ResourceNotFoundException {
        log.debug("Retrieving facility with ID: {}", facilityId);
        return facilityRepository.findById(facilityId)
                .orElseThrow(() -> {
                    log.warn("Facility not found with ID: {}", facilityId);
                    return new ResourceNotFoundException("Facility not found");
                });
    }

    @Transactional
    public void createFacility(CreateFacilityRequestDto request) throws AppException {
        log.debug("Creating facility with name: {}", request.name());

        try {
            // Map request DTO to entity
            Facility facility = facilityMapper.toEntity(request);

            // Save the facility
            facilityRepository.save(facility);

            log.info("Created facility with name: {}", request.name());
        } catch (Exception e) {
            log.error("Unexpected error while creating facility with name: {}", request.name(), e);
            throw new AppException("Failed to create facility");
        }
    }

    @Transactional
    public void updateFacility(UUID facilityId, UpdateFacilityRequestDto request) throws AppException {
        log.debug("Updating facility with ID: {}", facilityId);

        try {
            // Find existing facility
            Facility facility = findFacilityById(facilityId);

            // Update facility with new data
            facilityMapper.updateEntity(facility, request);

            // Save the updated facility
            facilityRepository.save(facility);

            log.info("Updated facility with ID: {}", facilityId);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while updating facility with ID: {}", facilityId, e);
            throw new AppException("Failed to update facility");
        }
    }

    @Transactional
    public void deleteFacility(UUID facilityId) throws AppException {
        log.debug("Deleting facility with ID: {}", facilityId);

        try {
            // Verify facility exists
            findFacilityById(facilityId);

            // Delete the facility
            facilityRepository.deleteById(facilityId);

            log.info("Deleted facility with ID: {}", facilityId);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while deleting facility with ID: {}", facilityId, e);
            throw new AppException("Failed to delete facility");
        }
    }

    @Transactional
    public void uploadThumbnailImageByFacilityId(UUID facilityId, MultipartFile file) throws AppException {
        log.debug("Uploading thumbnail image for facility with ID: {}", facilityId);

        try {
            Facility facility = findFacilityById(facilityId);

            Image image = imageService.updateAndGetImage(ImageType.FACILITY, facility.getId(), file);
            facility.setThumbnailImage(image);
            facilityRepository.save(facility);

            log.info("Uploaded thumbnail image for facility with ID: {}", facilityId);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while uploading thumbnail image for facility with ID: {}", facilityId, e);
            throw new AppException("Failed to upload thumbnail image");
        }
    }
}
