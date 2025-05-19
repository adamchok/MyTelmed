package com.mytelmed.mapper;

import com.mytelmed.model.dto.QnADto;
import com.mytelmed.model.entity.QnA;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface QnAMapper {
    QnADto toDto(QnA qnA);
}
