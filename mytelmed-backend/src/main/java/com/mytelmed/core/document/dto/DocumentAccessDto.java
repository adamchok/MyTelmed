package com.mytelmed.core.document.dto;

public record DocumentAccessDto(
        String id,
        String documentId,
        String documentName,
        String accountId,
        boolean canView,
        boolean canDownload,
        boolean canAttach,
        String expiryDate
) {
}
