package com.mytelmed.core.document.mapper;

import com.mytelmed.core.document.dto.DocumentAccessDto;
import com.mytelmed.core.document.entity.DocumentAccess;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface DocumentAccessMapper {
    @Mapping(target = "id", expression = "java(documentAccess.getId() != null ? documentAccess.getId().toString() : null)")
    @Mapping(target = "documentId", expression = "java(documentAccess.getDocument() != null && documentAccess.getDocument().getId() != null ?" +
            " documentAccess.getDocument().getId().toString() : null)")
    @Mapping(target = "accountId", expression = "java(documentAccess.getAccount() != null && documentAccess.getAccount().getId() != null ?" +
            " documentAccess.getAccount().getId().toString() : null)")
    DocumentAccessDto toDto(DocumentAccess documentAccess);
}
