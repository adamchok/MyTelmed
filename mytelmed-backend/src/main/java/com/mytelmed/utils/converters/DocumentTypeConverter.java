package com.mytelmed.utils.converters;

import com.mytelmed.constant.DocumentType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;


@Converter(autoApply = true)
public class DocumentTypeConverter implements AttributeConverter<DocumentType, String> {
    @Override
    public String convertToDatabaseColumn(DocumentType documentType) {
        if (documentType == null) {
            return null;
        }
        return documentType.toShortName();
    }

    @Override
    public DocumentType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return DocumentType.fromShortName(dbData);
    }
}
