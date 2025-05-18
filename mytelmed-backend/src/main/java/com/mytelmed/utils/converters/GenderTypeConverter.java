package com.mytelmed.utils.converters;

import com.mytelmed.constant.GenderType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;


@Converter(autoApply = true)
public class GenderTypeConverter implements AttributeConverter<GenderType, Character> {

    @Override
    public Character convertToDatabaseColumn(GenderType genderType) {
        if (genderType == null) {
            return null;
        }
        return genderType.toChar();
    }

    @Override
    public GenderType convertToEntityAttribute(Character dbData) {
        if (dbData == null) {
            return null;
        }
        
        return switch (dbData) {
            case 'm' -> GenderType.MALE;
            case 'f' -> GenderType.FEMALE;
            default -> throw new IllegalArgumentException("Unknown code: " + dbData);
        };
    }
}