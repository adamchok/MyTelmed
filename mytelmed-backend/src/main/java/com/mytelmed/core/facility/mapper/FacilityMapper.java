package com.mytelmed.core.facility.mapper;

import com.mytelmed.core.facility.dto.CreateFacilityRequestDto;
import com.mytelmed.core.facility.dto.FacilityDto;
import com.mytelmed.core.facility.dto.UpdateFacilityRequestDto;
import com.mytelmed.core.facility.entity.Facility;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import java.util.UUID;


@Mapper(componentModel = "spring")
public interface FacilityMapper {
    @Mapping(target = "id", source = "id", qualifiedByName = "mapUUID")
    @Mapping(target = "thumbnailUrl", expression = "java(mapThumbnailUrl(facility, awsS3Service))")
    FacilityDto toDto(Facility facility, @Context AwsS3Service awsS3Service);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "thumbnailImage", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Facility toEntity(CreateFacilityRequestDto requestDto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "thumbnailImage", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget Facility facility, UpdateFacilityRequestDto requestDto);

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

