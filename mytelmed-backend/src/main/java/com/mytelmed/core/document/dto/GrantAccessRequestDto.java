package com.mytelmed.core.document.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


public record GrantAccessRequestDto(
        @NotBlank(message = "Document ID is required")
        String documentId,

        @NotBlank(message = "Account ID is required")
        String accountId,

        @NotNull(message = "Can View is required")
        boolean canView,

        @NotNull(message = "Can Download is required")
        boolean canDownload,

        @NotNull(message = "Can Attach is required")
        boolean canAttach,

        @NotBlank(message = "Expiry Date is required")
        String expiryDate
) {
}
