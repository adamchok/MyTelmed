package com.mytelmed.mapper;

import com.mytelmed.model.dto.DoctorDto;
import com.mytelmed.model.entity.Doctor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface DoctorMapper {
    @Mapping(target = "id", expression = "java(doctor.getId().toString())")
    @Mapping(target = "imageUrl", expression = "java(doctor.getImage() != null ? doctor.getImage().getImageUrl() : " +
            "null)")
    DoctorDto toDto(Doctor doctor);

    @Mapping(target = "id", expression = "java(doctor.getId().toString())")
    @Mapping(target = "imageUrl", expression = "java(doctor.getImage() != null ? doctor.getImage().getImageUrl() : " +
            "null)")
    @Mapping(target = "nric", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "phone", ignore = true)
    @Mapping(target = "serialNumber", ignore = true)
    @Mapping(target = "gender", ignore = true)
    DoctorDto toDtoForAppointment(Doctor doctor);

    @Mapping(target = "id", ignore = true)
    Doctor toEntity(DoctorDto doctorDto);
}
