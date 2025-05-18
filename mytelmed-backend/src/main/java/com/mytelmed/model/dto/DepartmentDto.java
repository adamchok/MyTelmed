package com.mytelmed.model.dto;

public record DepartmentDto(
        String id,
        String name,
        String shortName,
        String description,
        String imageUrl
) {}
