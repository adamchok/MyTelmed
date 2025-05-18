package com.mytelmed.mapper;

import com.mytelmed.model.dto.FacilityDto;
import com.mytelmed.model.entity.Facility;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;


@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface FacilityMapper {
    @Mapping(target = "id", expression = "java(facility.getId().toString())")
    FacilityDto toDto(Facility facility);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "image", ignore = true)
    Facility toEntity(FacilityDto facilityDto);
}
