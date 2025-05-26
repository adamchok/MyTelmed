package com.mytelmed.core.patient.mapper;

import com.mytelmed.common.utils.DateTimeUtil;
import com.mytelmed.core.patient.dto.PatientDto;
import com.mytelmed.core.patient.entity.Patient;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.time.LocalDate;
import java.util.UUID;


@Mapper(componentModel = "spring")
public interface PatientMapper {
    @Mapping(target = "id", expression = "java(mapUUID(patient.getId()))")
    @Mapping(target = "dateOfBirth", expression = "java(formatDate(patient.getDateOfBirth()))")
    @Mapping(target = "gender", expression = "java(patient.getGender().name().toLowerCase())")
    @Mapping(target = "profileImageUrl",
            expression = "java(patient.getProfileImage() != null ? patient.getProfileImage().getImageUrl() : null)")
    PatientDto toDto(Patient patient);

    default String mapUUID(UUID id) {
        return id != null ? id.toString() : null;
    }

    default String formatDate(LocalDate date) {
        return date != null ? DateTimeUtil.localDateToUsString(date) : null;
    }
}
