package com.mytelmed.utils.converters;

import com.mytelmed.constant.AppointmentModeType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;


@Converter(autoApply = true)
public class AppointmentModeTypeConverter implements AttributeConverter<AppointmentModeType, String> {
    @Override
    public String convertToDatabaseColumn(AppointmentModeType modeType) {
        if (modeType == null) {
            return null;
        }
        return modeType.toShortName();
    }

    @Override
    public AppointmentModeType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return AppointmentModeType.fromShortName(dbData);
    }
}
