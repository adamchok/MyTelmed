package com.mytelmed.common.event.image;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;


public record ImageDeletedEvent(
        @NotNull(message = "Image Entity ID is required")
        UUID entityId,

        @NotNull(message = "Image key is required")
        String imageKey
) {
}
