package com.mytelmed.mapper;


import com.mytelmed.model.dto.AppointmentDto;
import com.mytelmed.model.entity.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface AppointmentMapper {
    @Mapping(target = "id", expression = "java(appointment.getId().toString())")
    AppointmentDto toDto(Appointment appointment);
}
