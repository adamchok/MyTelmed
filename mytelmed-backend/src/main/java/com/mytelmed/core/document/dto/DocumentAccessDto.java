package com.mytelmed.core.document.dto;

public record DocumentAccessDto(
        String id,
        boolean canView,
        boolean canAttach,
        String expiryDate
) {
}
