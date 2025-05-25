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
    @Mapping(target = "documentName", expression = "java(documentAccess.getDocument() != null && documentAccess.getDocument().getDocumentName() != " +
            "null ? documentAccess.getDocument().getDocumentName() : null)")
    @Mapping(target = "accountId", expression = "java(documentAccess.getPermittedAccount() != null && documentAccess.getPermittedAccount().getId() != null ?" +
            " documentAccess.getPermittedAccount().getId().toString() : null)")
    DocumentAccessDto toDto(DocumentAccess documentAccess);
}
