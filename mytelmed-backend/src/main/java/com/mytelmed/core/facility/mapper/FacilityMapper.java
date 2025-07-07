package com.mytelmed.core.facility.mapper;

import com.mytelmed.core.facility.dto.FacilityDto;
import com.mytelmed.core.facility.entity.Facility;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import java.util.UUID;


@Mapper(componentModel = "spring")
public interface FacilityMapper {
    @Mapping(target = "id", source = "id", qualifiedByName = "mapUUID")
    @Mapping(target = "thumbnailUrl", expression = "java(mapThumbnailUrl(facility, awsS3Service))")
    FacilityDto toDto(Facility facility, @Context AwsS3Service awsS3Service);

    @Named("mapUUID")
    default String mapUUID(UUID id) {
        return id != null ? id.toString() : null;
    }

    default String mapThumbnailUrl(Facility facility, @Context AwsS3Service awsS3Service) {
        if (facility.getThumbnailImage() != null && facility.getThumbnailImage().getImageKey() != null) {
            return awsS3Service.generatePresignedViewUrl(facility.getThumbnailImage().getImageKey());
        }
        return null;
    }
}

