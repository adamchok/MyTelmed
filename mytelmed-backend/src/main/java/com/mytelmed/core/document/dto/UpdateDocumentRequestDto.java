package com.mytelmed.core.document.dto;

import jakarta.validation.constraints.NotBlank;


public record UpdateDocumentRequestDto(
        @NotBlank(message = "Document name is required")
        String documentName
) {
}
