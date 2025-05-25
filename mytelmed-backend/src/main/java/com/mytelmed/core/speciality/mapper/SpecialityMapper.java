package com.mytelmed.core.speciality.mapper;

import com.mytelmed.core.speciality.dto.SpecialityDto;
import com.mytelmed.core.speciality.entity.Speciality;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface SpecialityMapper {
    @Mapping(target = "id",
            expression = "java(speciality.getId() != null ? speciality.getId().toString() : null)")
    @Mapping(target = "thumbnailImageUrl",
            expression = "java(speciality.getThumbnailImage() != null ? speciality.getThumbnailImage().getImageUrl() : null)")
    SpecialityDto toDto(Speciality speciality);
}
