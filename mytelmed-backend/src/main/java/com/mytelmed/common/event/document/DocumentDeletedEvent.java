package com.mytelmed.common.event.document;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;


public record DocumentDeletedEvent(
        @NotNull(message = "Document entity ID is required")
        UUID entityId,

        @NotNull(message = "Document key is required")
        String documentKey
) {
}
