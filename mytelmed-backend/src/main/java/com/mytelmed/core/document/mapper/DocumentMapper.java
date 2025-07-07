package com.mytelmed.core.document.mapper;

import com.mytelmed.core.document.dto.DocumentDto;
import com.mytelmed.core.document.entity.Document;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import java.util.UUID;


@Mapper(componentModel = "spring")
public interface DocumentMapper {
    @Mapping(target = "id", source = "id", qualifiedByName = "mapUUID")
    DocumentDto toDto(Document document);

    @Named("mapUUID")
    default String mapUUID(UUID id) {
        return id != null ? id.toString() : null;
    }
}

