package com.mytelmed.mapper;

import com.mytelmed.model.dto.request.CreateArticleRequestDto;
import com.mytelmed.model.dto.ArticleDto;
import com.mytelmed.model.entity.Article;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ArticleMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Article toEntity(CreateArticleRequestDto request);

    ArticleDto toDto(Article article);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", expression = "java(java.time.Instant.now())")
    void updateEntityFromDto(CreateArticleRequestDto request, @MappingTarget Article article);
}