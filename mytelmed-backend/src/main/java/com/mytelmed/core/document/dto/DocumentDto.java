package com.mytelmed.core.document.dto;

public record DocumentDto(
        String id,
        String documentName,
        String documentType,
        String documentSize,
        String createdAt,
        String updatedAt
) {
}
