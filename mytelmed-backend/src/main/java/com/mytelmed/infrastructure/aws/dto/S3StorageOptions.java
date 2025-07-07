package com.mytelmed.infrastructure.aws.dto;

import com.mytelmed.common.constant.file.FileType;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record S3StorageOptions(
                @NotBlank(message = "File type is required") FileType fileType,

                @NotBlank(message = "Folder name is required") String folderName,

                @NotBlank(message = "Entity ID is required") String entityId) {
}
