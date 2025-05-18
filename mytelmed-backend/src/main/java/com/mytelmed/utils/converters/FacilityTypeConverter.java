package com.mytelmed.utils.converters;

import com.mytelmed.constant.FacilityType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;


@Converter(autoApply = true)
public class FacilityTypeConverter implements AttributeConverter<FacilityType, Character> {

    @Override
    public Character convertToDatabaseColumn(FacilityType facilityType) {
        if (facilityType == null) {
            return null;
        }

        return facilityType.toChar();
    }

    @Override
    public FacilityType convertToEntityAttribute(Character dbData) {
        if (dbData == null) {
            return null;
        }

        return FacilityType.fromChar(dbData);
    }
}