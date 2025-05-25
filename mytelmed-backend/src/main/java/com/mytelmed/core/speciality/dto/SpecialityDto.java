package com.mytelmed.core.speciality.dto;

public record SpecialityDto(
        String id,
        String name,
        String abbreviation,
        String thumbnailImageUrl,
        String description
) {
    public SpecialityDto(String name, String abbreviation, String description) {
        this(null, name, abbreviation, null, description);
    }
}
