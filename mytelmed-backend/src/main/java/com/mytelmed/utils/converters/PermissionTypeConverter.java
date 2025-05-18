package com.mytelmed.utils.converters;

import com.mytelmed.constant.GenderType;
import com.mytelmed.constant.PermissionType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;


@Converter(autoApply = true)
public class PermissionTypeConverter implements AttributeConverter<PermissionType, String> {

    @Override
    public String convertToDatabaseColumn(PermissionType permissionType) {
        if (permissionType == null) {
            return null;
        }

        return permissionType.toShortName();
    }

    @Override
    public PermissionType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }

        return PermissionType.fromShortName(dbData);
    }
}
