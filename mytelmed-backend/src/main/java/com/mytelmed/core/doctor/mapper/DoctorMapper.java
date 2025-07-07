package com.mytelmed.core.doctor.mapper;

import com.mytelmed.common.constant.Language;
import com.mytelmed.common.utils.DateTimeUtil;
import com.mytelmed.core.doctor.dto.DoctorDto;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.facility.mapper.FacilityMapper;
import com.mytelmed.core.speciality.mapper.SpecialityMapper;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;


@Mapper(componentModel = "spring", uses = {FacilityMapper.class, SpecialityMapper.class})
public interface DoctorMapper {
    @Mapping(target = "id", source = "id", qualifiedByName = "mapUUID")
    @Mapping(target = "dateOfBirth", source = "dateOfBirth", qualifiedByName = "formatDate")
    @Mapping(target = "gender", source = "gender", qualifiedByName = "mapGender")
    @Mapping(target = "languageList", source = "languageList", qualifiedByName = "mapLanguages")
    @Mapping(target = "profileImageUrl", expression = "java(mapProfileImageUrl(doctor, awsS3Service))")
    DoctorDto toDto(Doctor doctor, @Context AwsS3Service awsS3Service);

    @Named("formatDate")
    default String formatDate(LocalDate date) {
        return date != null ? DateTimeUtil.localDateToUsString(date) : null;
    }

    @Named("mapGender")
    default String mapGender(Enum<?> gender) {
        return gender != null ? gender.name().toLowerCase() : null;
    }

    @Named("mapLanguages")
    default List<String> mapLanguages(List<Language> languages) {
        return languages != null ? languages.stream()
                .map(Enum::name)
                .map(String::toLowerCase)
                .collect(Collectors.toList()) : null;
    }

    default String mapProfileImageUrl(Doctor doctor, @Context AwsS3Service awsS3Service) {
        if (doctor.getProfileImage() != null && doctor.getProfileImage().getImageKey() != null) {
            return awsS3Service.generatePresignedViewUrl(doctor.getProfileImage().getImageKey());
        }
        return null;
    }
}

