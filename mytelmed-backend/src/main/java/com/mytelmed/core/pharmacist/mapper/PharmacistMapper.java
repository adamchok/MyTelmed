package com.mytelmed.core.pharmacist.mapper;

import com.mytelmed.common.utils.DateTimeUtil;
import com.mytelmed.core.facility.mapper.FacilityMapper;
import com.mytelmed.core.pharmacist.dto.PharmacistDto;
import com.mytelmed.core.pharmacist.entity.Pharmacist;
import com.mytelmed.core.speciality.mapper.SpecialityMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.time.LocalDate;
import java.util.UUID;


@Mapper(componentModel = "spring", uses = {FacilityMapper.class, SpecialityMapper.class})
public interface PharmacistMapper {
    @Mapping(target = "id", expression = "java(mapUUID(doctor.getId()))")
    @Mapping(target = "dateOfBirth", expression = "java(formatDate(doctor.getDateOfBirth()))")
    @Mapping(target = "gender", expression = "java(doctor.getGender().name().toLowerCase())")
    @Mapping(target = "profileImageUrl",
            expression = "java(doctor.getProfileImage() != null ? doctor.getProfileImage().getImageUrl() : null)")
    PharmacistDto toDto(Pharmacist pharmacist);

    default String mapUUID(UUID id) {
        return id != null ? id.toString() : null;
    }

    default String formatDate(LocalDate date) {
        return date != null ? DateTimeUtil.localDateToUsString(date) : null;
    }
}
