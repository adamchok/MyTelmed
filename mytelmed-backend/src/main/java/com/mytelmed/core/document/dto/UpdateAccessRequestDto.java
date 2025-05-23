package com.mytelmed.core.document.dto;

public record UpdateAccessRequestDto(
        boolean canView,
        boolean canDownload,
        String expiryDate
) {
}
