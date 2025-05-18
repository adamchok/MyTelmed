package com.mytelmed.utils.converters;

import com.mytelmed.constant.EntityType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class EntityTypeConverter implements AttributeConverter<EntityType, Character> {

    @Override
    public Character convertToDatabaseColumn(EntityType entityType) {
        if (entityType == null) {
            return null;
        }
        return entityType.toChar();
    }

    @Override
    public EntityType convertToEntityAttribute(Character dbData) {
        if (dbData == null) {
            return null;
        }
        
        return switch (dbData) {
            case 'f' -> EntityType.FACILITY;
            case 'd' -> EntityType.DOCTOR;
            case 'p' -> EntityType.PATIENT;
            default -> throw new IllegalArgumentException("Unknown code: " + dbData);
        };
    }
}