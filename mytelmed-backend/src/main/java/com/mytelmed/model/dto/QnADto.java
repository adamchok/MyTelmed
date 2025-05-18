package com.mytelmed.model.dto;

public record QnADto(
        String id,
        String question,
        String answer,
        String department,
        String answeredBy,
        String createdAt,
        String updatedAt,
        String lastAnsweredAt
) {}
