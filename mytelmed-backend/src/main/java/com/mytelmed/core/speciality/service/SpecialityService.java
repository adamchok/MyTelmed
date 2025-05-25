package com.mytelmed.core.speciality.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constants.ImageType;
import com.mytelmed.core.image.entity.Image;
import com.mytelmed.core.image.service.ImageService;
import com.mytelmed.core.speciality.entity.Speciality;
import com.mytelmed.core.speciality.repository.SpecialityRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;


@Slf4j
@Service
public class SpecialityService {
    private final SpecialityRepository specialityRepository;
    private final ImageService imageService;

    public SpecialityService(SpecialityRepository specialityRepository, ImageService imageService) {
        this.specialityRepository = specialityRepository;
        this.imageService = imageService;
    }

    @Transactional(readOnly = true)
    public long countAllSpecialities() {
        return specialityRepository.count();
    }

    @Transactional(readOnly = true)
    public Speciality findSpecialityByName(String specialityName) {
        return specialityRepository.findByName(specialityName)
                .orElseThrow(() -> {
                    log.warn("Speciality not found with name: {}", specialityName);
                    return new ResourceNotFoundException("Speciality not found");
                });
    }

    @Transactional(readOnly = true)
    public List<Speciality> findAllSpecialitiesByIdList(List<UUID> specialityIdList) {
        return specialityRepository.findAllById(specialityIdList);
    }

    public boolean saveSpeciality(Speciality speciality) {
        log.debug("Saving speciality: {}", speciality.getName());

        try {
            specialityRepository.save(speciality);
            return true;
        } catch (Exception e) {
            log.error("Failed to save speciality: {}", speciality.getName(), e);
        }

        return false;
    }

    @Transactional
    public void uploadThumbnailImageBySpecialityName(String specialityName, MultipartFile thumbnailFile) {
        log.debug("Uploading thumbnail image for speciality with name: {}", specialityName);

        try {
            Speciality speciality = findSpecialityByName(specialityName);

            Image image = imageService.saveAndGetImage(ImageType.SPECIALITY, speciality.getId(), thumbnailFile);
            speciality.setThumbnailImage(image);
            specialityRepository.save(speciality);

            log.info("Uploaded thumbnail image for speciality with name: {}", specialityName);
        } catch (Exception e) {
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            log.error("Unexpected error occurred while uploading thumbnail image for speciality with name: {}", specialityName, e);
            throw new AppException("Failed to upload thumbnail image for selected speciality");
        }
    }
}
