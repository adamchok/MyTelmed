package com.mytelmed.core.document.dto;

import jakarta.validation.constraints.NotBlank;


public record CreateDocumentRequestDto(
        @NotBlank(message = "Document name is required")
        String documentName,

        @NotBlank(message = "Document type is required")
        String documentType
) {
}
