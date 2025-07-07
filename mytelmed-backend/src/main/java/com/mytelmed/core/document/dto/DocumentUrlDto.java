package com.mytelmed.core.document.dto;

import lombok.Builder;


@Builder
public record DocumentUrlDto(
        String documentUrl
) {
}
