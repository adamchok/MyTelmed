package com.mytelmed.core.facility.mapper;

import com.mytelmed.core.facility.dto.FacilityDto;
import com.mytelmed.core.facility.entity.Facility;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface FacilityMapper {
    @Mapping(target = "id",
            expression = "java(facility.getId() != null ? facility.getId().toString() : null)")
    @Mapping(target = "thumbnailUrl",
            expression = "java(facility.getThumbnailImage() != null ? facility.getThumbnailImage().getImageUrl() : null)")
    FacilityDto toDto(Facility facility);
}
