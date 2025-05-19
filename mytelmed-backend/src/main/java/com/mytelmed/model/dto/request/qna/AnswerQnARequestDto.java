package com.mytelmed.model.dto.request.qna;

import jakarta.validation.constraints.NotBlank;


public record AnswerQnARequestDto(
        @NotBlank(message = "Answer is required")
        String answer,

        @NotBlank(message = "Answered by is required")
        String answeredBy
) {}
