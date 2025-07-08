package com.mytelmed.core.article.mapper;

import com.mytelmed.core.article.dto.ArticleDto;
import com.mytelmed.core.article.entity.Article;
import org.mapstruct.Mapper;


@Mapper(componentModel = "spring")
public interface ArticleMapper {
    ArticleDto toDto(Article article);
}
