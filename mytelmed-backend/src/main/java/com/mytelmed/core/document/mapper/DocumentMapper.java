package com.mytelmed.core.document.mapper;

import com.mytelmed.core.document.dto.DocumentDto;
import com.mytelmed.core.document.entity.Document;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface DocumentMapper {
    @Mapping(target = "id", expression = "java(document.getId() != null ? document.getId().toString() : null)")
    DocumentDto toDto(Document document);
}
