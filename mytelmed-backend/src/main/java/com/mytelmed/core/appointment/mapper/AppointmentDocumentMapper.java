package com.mytelmed.core.appointment.mapper;

import com.mytelmed.core.appointment.dto.AppointmentDocumentDto;
import com.mytelmed.core.appointment.entity.AppointmentDocument;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import java.util.UUID;


@Mapper(componentModel = "spring")
public interface AppointmentDocumentMapper {
    @Mapping(source = "appointmentDocument.id", target = "id", qualifiedByName = "mapUUID")
    @Mapping(source = "appointmentDocument.document.id", target = "documentId", qualifiedByName = "mapUUID")
    @Mapping(source = "appointmentDocument.document.documentName", target = "documentName")
    @Mapping(source = "appointmentDocument.document.documentType", target = "documentType")
    @Mapping(source = "appointmentDocument.document.documentSize", target = "documentSize")
    @Mapping(source = "appointmentDocument.document.createdAt", target = "createdAt")
    @Mapping(target = "documentUrl", expression =
            "java(awsS3Service.generatePresignedDocumentUrl(appointmentDocument.getDocument().getDocumentKey()))")
    AppointmentDocumentDto toDto(AppointmentDocument appointmentDocument, AwsS3Service awsS3Service);

    @Named("mapUUID")
    static String mapUUID(UUID id) {
        return id != null ? id.toString() : null;
    }
}
