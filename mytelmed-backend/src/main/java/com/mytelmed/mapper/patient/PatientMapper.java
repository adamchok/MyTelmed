package com.mytelmed.mapper.patient;


import com.mytelmed.model.dto.PatientDto;
import com.mytelmed.model.entity.object.Patient;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface PatientMapper {
    @Mapping(target = "id", expression = "java(patient.getId().toString())")
    PatientDto toDto(Patient patient);

    @Mapping(target = "id", ignore = true)
    Patient toEntity(PatientDto patientDto);
}
