package com.mytelmed.core.document.mapper;

import com.mytelmed.core.document.dto.DocumentAccessDto;
import com.mytelmed.core.document.entity.DocumentAccess;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import java.util.UUID;


@Mapper(componentModel = "spring")
public interface DocumentAccessMapper {
    @Mapping(target = "id", source = "id", qualifiedByName = "mapUUID")
    @Mapping(target = "documentId", source = "document.id", qualifiedByName = "mapUUID")
    @Mapping(target = "documentName", source = "document.documentName")
    @Mapping(target = "accountId", source = "permittedAccount.id", qualifiedByName = "mapUUID")
    DocumentAccessDto toDto(DocumentAccess documentAccess);

    @Named("mapUUID")
    default String mapUUID(UUID id) {
        return id != null ? id.toString() : null;
    }
}

