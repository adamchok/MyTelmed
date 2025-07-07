package com.mytelmed.core.patient.mapper;

import com.mytelmed.common.constant.Gender;
import com.mytelmed.common.utils.DateTimeUtil;
import com.mytelmed.core.patient.dto.PatientDto;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import java.time.LocalDate;
import java.util.UUID;


@Mapper(componentModel = "spring")
public interface PatientMapper {
    @Mapping(target = "id", source = "id", qualifiedByName = "mapUUID")
    @Mapping(target = "dateOfBirth", source = "dateOfBirth", qualifiedByName = "formatDate")
    @Mapping(target = "gender", source = "gender", qualifiedByName = "mapGender")
    @Mapping(target = "profileImageUrl", expression = "java(mapProfileImageUrl(patient, awsS3Service))")
    PatientDto toDto(Patient patient, @Context AwsS3Service awsS3Service);

    @Named("mapUUID")
    default String mapUUID(UUID id) {
        return id != null ? id.toString() : null;
    }

    @Named("mapGender")
    default String mapGender(Gender gender) {
        return gender.name();
    }

    @Named("formatDate")
    default String formatDate(LocalDate date) {
        return date != null ? DateTimeUtil.localDateToUsString(date) : null;
    }

    default String mapProfileImageUrl(Patient patient, @Context AwsS3Service awsS3Service) {
        if (patient.getProfileImage() != null && patient.getProfileImage().getImageKey() != null) {
            return awsS3Service.generatePresignedViewUrl(patient.getProfileImage().getImageKey());
        }
        return null;
    }
}

