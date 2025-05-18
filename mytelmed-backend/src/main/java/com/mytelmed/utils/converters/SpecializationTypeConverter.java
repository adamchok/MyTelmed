package com.mytelmed.utils.converters;

import com.mytelmed.constant.SpecializationType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SpecializationTypeConverter implements AttributeConverter<SpecializationType, String> {
    @Override
    public String convertToDatabaseColumn(SpecializationType specializationType) {
        if (specializationType == null) {
            return null;
        }
        return specializationType.toShortName();
    }

    @Override
    public SpecializationType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return SpecializationType.fromShortName(dbData);
    }
}
