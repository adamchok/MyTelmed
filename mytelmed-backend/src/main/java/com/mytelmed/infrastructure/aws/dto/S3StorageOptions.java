package com.mytelmed.infrastructure.aws.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;


@Builder
public record S3StorageOptions(
        @NotBlank(message = "Bucket name is required")
        String folderName,

        @NotBlank(message = "Entity Id is required")
        String entityId,

        @NotBlank(message = "Public access is required")
        boolean publicAccess
) {
}
