package com.mytelmed.core.family.mapper;

import com.mytelmed.core.family.dto.FamilyMemberDto;
import com.mytelmed.core.family.entity.FamilyMember;
import com.mytelmed.core.patient.mapper.PatientMapper;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring", uses = {PatientMapper.class})
public interface FamilyMemberMapper {
    @Mapping(target = "id", expression = "java(familyMember.getId() != null ? familyMember.getId().toString() : null)")
    FamilyMemberDto toDto(FamilyMember familyMember, @Context AwsS3Service awsS3Service);
}
