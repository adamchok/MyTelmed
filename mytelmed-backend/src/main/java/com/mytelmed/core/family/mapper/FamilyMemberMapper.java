package com.mytelmed.core.family.mapper;

import com.mytelmed.core.family.dto.FamilyMemberDto;
import com.mytelmed.core.family.entity.FamilyMember;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface FamilyMemberMapper {
    @Mapping(target = "id", expression = "java(familyMember.getId() != null ? familyMember.getId().toString() : null)")
    FamilyMemberDto toDto(FamilyMember familyMember);
}
