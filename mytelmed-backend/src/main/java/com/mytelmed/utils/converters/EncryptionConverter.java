package com.mytelmed.utils.converters;

import com.mytelmed.utils.AesEncryptionUtil;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Component
@Converter
public class EncryptionConverter implements AttributeConverter<String, String> {
    private static AesEncryptionUtil aesUtil;

    @Autowired
    public void setAesUtil(AesEncryptionUtil util) {
        EncryptionConverter.aesUtil = util;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        try {
            return aesUtil.encrypt(attribute);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        try {
            return aesUtil.decrypt(dbData);
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }
}

