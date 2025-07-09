package com.mytelmed.core.admin.mapper;

import com.mytelmed.core.admin.dto.AdminDto;
import com.mytelmed.core.admin.entity.Admin;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import java.util.UUID;


@Mapper(componentModel = "spring")
public interface AdminMapper {
    @Mapping(target = "id", source = "id", qualifiedByName = "mapUUID")
    @Mapping(target = "profileImageUrl", expression = "java(mapProfileImageUrl(admin, awsS3Service))")
    @Mapping(target = "enabled", source = "account.enabled")
    AdminDto toDto(Admin admin, @Context AwsS3Service awsS3Service);

    @Named("mapUUID")
    default String mapUUID(UUID id) {
        return id != null ? id.toString() : null;
    }

    default String mapProfileImageUrl(Admin admin, @Context AwsS3Service awsS3Service) {
        if (admin.getProfileImage() != null && admin.getProfileImage().getImageKey() != null) {
            return awsS3Service.generatePresignedViewUrl(admin.getProfileImage().getImageKey());
        }
        return null;
    }
}
