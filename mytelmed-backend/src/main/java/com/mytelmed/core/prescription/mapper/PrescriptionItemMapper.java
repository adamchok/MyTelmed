package com.mytelmed.core.prescription.mapper;

import com.mytelmed.core.prescription.dto.PrescriptionItemDto;
import com.mytelmed.core.prescription.entity.PrescriptionItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper for converting between PrescriptionItem entities and DTOs.
 */
@Mapper(componentModel = "spring")
public interface PrescriptionItemMapper {
    @Mapping(target = "id", expression = "java(prescriptionItem.getId().toString())")
    PrescriptionItemDto toDto(PrescriptionItem prescriptionItem);
}
