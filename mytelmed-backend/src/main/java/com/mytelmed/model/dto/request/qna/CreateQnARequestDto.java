package com.mytelmed.model.dto.request.qna;

import jakarta.validation.constraints.NotBlank;


public record CreateQnARequestDto(
        @NotBlank(message = "Question is required")
        String question,

        @NotBlank(message = "Department is required")
        String department
) {}
