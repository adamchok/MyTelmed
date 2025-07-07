package com.mytelmed.core.videocall.mapper;

import com.mytelmed.core.videocall.dto.VideoCallDto;
import com.mytelmed.core.videocall.entity.VideoCall;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import java.util.UUID;


@Mapper(componentModel = "spring")
public interface VideoCallMapper {
    @Mapping(source = "id", target = "id", qualifiedByName = "mapUUID")
    @Mapping(source = "appointment.id", target = "appointmentId", qualifiedByName = "mapUUID")
    VideoCallDto toDto(VideoCall videoCall);

    @Named("mapUUID")
    static String mapUUID(UUID id) {
        return id != null ? id.toString() : null;
    }
}
