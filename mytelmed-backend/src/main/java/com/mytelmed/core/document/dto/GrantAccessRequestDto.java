package com.mytelmed.core.document.dto;

public record GrantAccessRequestDto(
        String documentId,
        String accountId,
        boolean canView,
        boolean canDownload,
        boolean canAttach,
        String expiryDate
) {
}
