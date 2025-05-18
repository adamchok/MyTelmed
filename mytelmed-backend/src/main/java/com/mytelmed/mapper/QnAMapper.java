package com.mytelmed.mapper;

import com.mytelmed.model.dto.QnADto;
import com.mytelmed.model.entity.QnA;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface QnAMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    QnA toEntity(QnADto request);

    QnADto toDto(QnA qnA);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", expression = "java(java.time.Instant.now())")
    void updateEntityFromDto(QnADto request, @MappingTarget QnA article);
}
