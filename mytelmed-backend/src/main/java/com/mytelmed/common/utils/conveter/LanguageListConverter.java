package com.mytelmed.common.utils.conveter;

import com.mytelmed.common.constant.Language;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;


@Converter
public class LanguageListConverter implements AttributeConverter<List<Language>, String> {
    @Override
    public String convertToDatabaseColumn(List<Language> languages) {
        return languages != null ? languages.stream()
                .map(Enum::name)
                .collect(Collectors.joining(",")) : "";
    }

    @Override
    public List<Language> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) return new ArrayList<>();
        return Arrays.stream(dbData.split(","))
                .map(String::trim)
                .map(Language::valueOf)
                .collect(Collectors.toList());
    }
}
