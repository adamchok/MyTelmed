package com.mytelmed.core.speciality.mapper;

import com.mytelmed.core.facility.mapper.FacilityMapper;
import com.mytelmed.core.speciality.dto.SpecialityDto;
import com.mytelmed.core.speciality.entity.Speciality;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring", uses = {FacilityMapper.class})
public interface SpecialityMapper {
    @Mapping(target = "id", source = "id", qualifiedByName = "mapUUID")
    @Mapping(target = "thumbnailImageUrl", expression = "java(mapThumbnailUrl(speciality, awsS3Service))")
    SpecialityDto toDto(Speciality speciality, @Context AwsS3Service awsS3Service);

    default String mapThumbnailUrl(Speciality speciality, @Context AwsS3Service awsS3Service) {
        if (speciality.getThumbnailImage() != null && speciality.getThumbnailImage().getImageKey() != null) {
            return awsS3Service.generatePresignedViewUrl(speciality.getThumbnailImage().getImageKey());
        }
        return null;
    }
}

