package com.mytelmed.core.pharmacist.mapper;

import com.mytelmed.common.constant.Gender;
import com.mytelmed.common.utils.DateTimeUtil;
import com.mytelmed.core.facility.mapper.FacilityMapper;
import com.mytelmed.core.image.entity.Image;
import com.mytelmed.core.pharmacist.dto.PharmacistDto;
import com.mytelmed.core.pharmacist.entity.Pharmacist;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import java.time.LocalDate;


@Mapper(componentModel = "spring", uses = {FacilityMapper.class})
public interface PharmacistMapper {

    @Mapping(target = "id", source = "id", qualifiedByName = "mapUUID")
    @Mapping(target = "dateOfBirth", source = "dateOfBirth", qualifiedByName = "formatDate")
    @Mapping(target = "gender", source = "gender", qualifiedByName = "formatGender")
    @Mapping(target = "profileImageUrl", expression = "java(mapProfileImageUrl(pharmacist.getProfileImage(), awsS3Service))")
    PharmacistDto toDto(Pharmacist pharmacist, @Context AwsS3Service awsS3Service);

    @Named("formatDate")
    default String formatDate(LocalDate date) {
        return date != null ? DateTimeUtil.localDateToUsString(date) : null;
    }

    @Named("formatGender")
    default String formatGender(Gender gender) {
        return gender != null ? gender.name() : null;
    }

    default String mapProfileImageUrl(Image image, @Context AwsS3Service awsS3Service) {
        if (image != null && image.getImageKey() != null) {
            return awsS3Service.generatePresignedViewUrl(image.getImageKey());
        }
        return null;
    }
}

