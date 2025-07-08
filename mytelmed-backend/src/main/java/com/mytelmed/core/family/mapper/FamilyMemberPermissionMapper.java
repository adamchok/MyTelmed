package com.mytelmed.core.family.mapper;

import com.mytelmed.core.family.dto.FamilyMemberPermissionDto;
import com.mytelmed.core.family.entity.FamilyMemberPermission;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import java.time.LocalDate;
import java.util.UUID;

@Mapper(componentModel = "spring")
public interface FamilyMemberPermissionMapper {
    
    @Mapping(target = "id", source = "id", qualifiedByName = "mapUUID")
    @Mapping(target = "familyMemberId", source = "familyMember.id", qualifiedByName = "mapUUID")
    @Mapping(target = "expiryDate", source = "expiryDate", qualifiedByName = "mapLocalDate")
    FamilyMemberPermissionDto toDto(FamilyMemberPermission permission);

    @Named("mapUUID")
    default String mapUUID(UUID id) {
        return id != null ? id.toString() : null;
    }

    @Named("mapLocalDate")
    default String mapLocalDate(LocalDate date) {
        return date != null ? date.toString() : null;
    }
}
