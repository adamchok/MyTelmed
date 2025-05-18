package com.mytelmed.utils.converters;

import com.mytelmed.constant.EntityType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class EntityTypeConverter implements AttributeConverter<EntityType, String> {

    @Override
    public String convertToDatabaseColumn(EntityType entityType) {
        if (entityType == null) {
            return null;
        }
        return entityType.toShortName();
    }

    @Override
    public EntityType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return EntityType.fromShortName(dbData);
    }
}