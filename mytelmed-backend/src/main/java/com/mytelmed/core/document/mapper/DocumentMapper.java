package com.mytelmed.core.document.mapper;

import com.mytelmed.core.document.dto.DocumentDto;
import com.mytelmed.core.document.entity.Document;
import com.mytelmed.core.patient.mapper.PatientMapper;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring", uses = {DocumentAccessMapper.class, PatientMapper.class})
public interface DocumentMapper {
    @Mapping(target = "id", source = "id", qualifiedByName = "mapUUID")
    @Mapping(target = "documentUrl", expression = "java(mapDocumentUrl(document, awsS3Service))")
    DocumentDto toDto(Document document, @Context AwsS3Service awsS3Service);

    default String mapDocumentUrl(Document document, @Context AwsS3Service awsS3Service) {
        if (document != null && document.getDocumentKey() != null) {
            return awsS3Service.generatePresignedDocumentUrl(document.getDocumentKey());
        }
        return null;
    }
}

