package com.mytelmed.common.utils.conveter;

import com.mytelmed.common.advice.exception.EncryptionFailedException;
import com.mytelmed.common.utils.AesEncryptionUtil;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Component
@Converter(autoApply = true)
public class EncryptionConverter implements AttributeConverter<String, String> {
    private static AesEncryptionUtil aesEncryptionUtil;

    @Autowired
    public void setAesUtil(AesEncryptionUtil aesEncryptionUtil) {
        EncryptionConverter.aesEncryptionUtil = aesEncryptionUtil;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        try {
            return aesEncryptionUtil.encrypt(attribute);
        } catch (Exception e) {
            throw new EncryptionFailedException("Encryption failed for attribute [" + attribute + "]: " + e.getMessage());
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        try {
            return aesEncryptionUtil.decrypt(dbData);
        } catch (Exception e) {
            throw new EncryptionFailedException("Decryption failed for data [" + dbData + "]: " + e.getMessage());
        }
    }
}
