package com.mytelmed.core.article.mapper;

import com.mytelmed.core.article.dto.ArticleDto;
import com.mytelmed.core.article.entity.Article;
import com.mytelmed.core.image.entity.Image;
import com.mytelmed.core.image.service.ImageService;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.UUID;


@Mapper(componentModel = "spring")
public abstract class ArticleMapper {
    @Mapping(target = "thumbnailUrl", expression =
            "java(generateThumbnailUrl(article, imageService, awsS3Service))")
    public abstract ArticleDto toDto(Article article, ImageService imageService, AwsS3Service awsS3Service);

    protected String generateThumbnailUrl(Article article, ImageService imageService, AwsS3Service awsS3Service) {
        if (article.getImageId() == null) return null;
        try {
            Image image = imageService.getImageById(UUID.fromString(article.getImageId()));
            return awsS3Service.generatePresignedViewUrl(image.getImageKey());
        } catch (Exception e) {
            return null;
        }
    }
}
