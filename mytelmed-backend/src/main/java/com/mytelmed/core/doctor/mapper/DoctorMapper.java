package com.mytelmed.core.doctor.mapper;

import com.mytelmed.common.constants.Language;
import com.mytelmed.common.utils.DateTimeUtil;
import com.mytelmed.core.doctor.dto.DoctorDto;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.facility.mapper.FacilityMapper;
import com.mytelmed.core.speciality.mapper.SpecialityMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Mapper(componentModel = "spring", uses = { FacilityMapper.class, SpecialityMapper.class })
public interface DoctorMapper {
    @Mapping(target = "id", expression = "java(mapUUID(doctor.getId()))")
    @Mapping(target = "dateOfBirth", expression = "java(formatDate(doctor.getDateOfBirth()))")
    @Mapping(target = "gender", expression = "java(doctor.getGender().name())")
    @Mapping(target = "languageList", expression = "java(mapLanguages(doctor.getLanguageList()))")
    @Mapping(target = "profileImageUrl",
            expression = "java(doctor.getProfileImage() != null ? doctor.getProfileImage().getImageUrl() : null)")
    DoctorDto toDto(Doctor doctor);

    default String mapUUID(UUID id) {
        return id != null ? id.toString() : null;
    }

    default String formatDate(LocalDate date) {
        return date != null ? DateTimeUtil.localDateToUsString(date) : null;
    }

    default List<String> mapLanguages(List<Language> languages) {
        return languages != null ? languages.stream()
                .map(Enum::name)
                .map(String::toLowerCase)
                .collect(Collectors.toList()) : null;
    }
}
