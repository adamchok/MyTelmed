package com.mytelmed.core.timeslot.mapper;

import com.mytelmed.core.timeslot.dto.TimeSlotDto;
import com.mytelmed.core.timeslot.entity.TimeSlot;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import java.util.UUID;


@Mapper(componentModel = "spring")
public interface TimeSlotMapper {
    @Mapping(source = "id", target = "id", qualifiedByName = "mapUUID")
    @Mapping(source = "doctor.id", target = "doctorId", qualifiedByName = "mapUUID")
    TimeSlotDto toDto(TimeSlot timeSlot);

    @Named("mapUUID")
    static String mapUUID(UUID id) {
        return id != null ? id.toString() : null;
    }
}
