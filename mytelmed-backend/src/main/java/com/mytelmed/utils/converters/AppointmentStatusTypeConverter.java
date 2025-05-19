package com.mytelmed.utils.converters;

import com.mytelmed.constant.AppointmentModeType;
import com.mytelmed.constant.AppointmentStatusType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;


@Converter(autoApply = true)
public class AppointmentStatusTypeConverter implements AttributeConverter<AppointmentStatusType, String> {
    @Override
    public String convertToDatabaseColumn(AppointmentStatusType statusType) {
        if (statusType == null) {
            return null;
        }
        return statusType.toShortName();
    }

    @Override
    public AppointmentStatusType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return AppointmentStatusType.fromShortName(dbData);
    }
}
