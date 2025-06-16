package com.mytelmed.common.events.deletion;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;


public record ImageDeletedEvent(
        @NotNull
        UUID entityId,

        @NotNull
        String imageKey
) {
}
