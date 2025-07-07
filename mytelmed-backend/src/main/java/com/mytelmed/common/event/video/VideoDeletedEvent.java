package com.mytelmed.common.event.video;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;


public record VideoDeletedEvent(
        @NotNull(message = "Video Entity ID is required")
        UUID entityId,

        @NotNull(message = "Video key is required")
        String videoKey
) {
}
