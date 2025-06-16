package com.mytelmed.common.events.deletion;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;


public record VideoDeletedEvent(
        @NotNull
        UUID entityId,

        @NotNull
        String videoKey
) {
}

