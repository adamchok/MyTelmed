package com.mytelmed.core.document.mapper;

import com.mytelmed.core.document.dto.DocumentAccessDto;
import com.mytelmed.core.document.entity.DocumentAccess;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;


@Mapper(componentModel = "spring")
public interface DocumentAccessMapper {
    @Mapping(target = "id", expression = "java(documentAccess.getId() != null ? documentAccess.getId().toString() : null)")
    @Mapping(target = "canView", source = "canView")
    @Mapping(target = "canAttach", source = "canAttach")
    @Mapping(target = "expiryDate", source = "expiryDate", qualifiedByName = "mapLocalDate")
    DocumentAccessDto toDto(DocumentAccess documentAccess);

    @Named("mapLocalDate")
    default String mapLocalDate(java.time.LocalDate date) {
        return date != null ? date.toString() : null;
    }
}

