package com.mytelmed.mapper;

import com.mytelmed.model.dto.ArticleDto;
import com.mytelmed.model.entity.Article;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface ArticleMapper {
    ArticleDto toDto(Article article);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Article toEntity(ArticleDto request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", expression = "java(java.time.Instant.now())")
    void updateEntityFromDto(ArticleDto request, @MappingTarget Article article);
}