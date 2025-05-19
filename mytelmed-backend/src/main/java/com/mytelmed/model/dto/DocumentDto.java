package com.mytelmed.model.dto;

import lombok.Builder;
import java.time.Instant;


@Builder
public record DocumentDto(
    String id,
    String fileName,
    String fileType,
    Instant uploadDate,
    String fileSize,
    String documentUrl
) {}