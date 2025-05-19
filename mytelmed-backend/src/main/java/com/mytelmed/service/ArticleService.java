package com.mytelmed.service;

import com.mytelmed.constant.EntityType;
import com.mytelmed.mapper.ArticleMapper;
import com.mytelmed.model.dto.ArticleDto;
import com.mytelmed.model.entity.Article;
import com.mytelmed.model.entity.files.Image;
import com.mytelmed.repository.ArticleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.UUID;

@Service
public class ArticleService {
    private final ImageService imageService;
    private final ArticleRepository articleRepository;
    private final ArticleMapper articleMapper;

    public ArticleService(ImageService imageService, ArticleRepository articleRepository, ArticleMapper articleMapper) {
        this.imageService = imageService;
        this.articleRepository = articleRepository;
        this.articleMapper = articleMapper;
    }
    
    public Page<ArticleDto> getAllArticles(int page, int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<Article> articles = articleRepository.findAll(pageable);
        return articles.map(articleMapper::toDto);
    }
    
    public Page<ArticleDto> getArticlesByDepartment(String department, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<Article> articles = articleRepository.findByDepartment(department, pageable);
        return articles.map(articleMapper::toDto);
    }
    
    public ArticleDto getArticleById(String department, String id) {
        Article article = articleRepository.findById(department, id)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        return articleMapper.toDto(article);
    }

    public ArticleDto createArticleWithoutImage(ArticleDto request) {
        Article article = articleMapper.toEntity(request);
        article.setId(UUID.randomUUID().toString());
        article.setCreatedAt(Instant.now());
        article.setUpdatedAt(Instant.now());

        Article savedArticle = articleRepository.save(article);
        return articleMapper.toDto(savedArticle);
    }

    public ArticleDto createArticleWithImage(ArticleDto request, MultipartFile imageFile) {
        UUID articleId = UUID.randomUUID();

        Image image = imageService.saveImage(EntityType.ARTICLE, articleId, imageFile, true)
                .orElseThrow(() -> new RuntimeException("Failed to save image"));

        Article article = articleMapper.toEntity(request);
        article.setId(articleId.toString());
        article.setCreatedAt(Instant.now());
        article.setUpdatedAt(Instant.now());
        article.setImageUrl(image.getImageUrl());

        Article savedArticle = articleRepository.save(article);
        return articleMapper.toDto(savedArticle);
    }
    
    public ArticleDto updateArticleWithoutImage(String department, String id, ArticleDto request) {
        Article article = articleRepository.findById(department, id)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        articleMapper.updateEntityFromDto(request, article);

        if (request.department() != null && !request.department().equals(article.getDepartment())) {
            articleRepository.delete(article);
        }
        
        Article updatedArticle = articleRepository.save(article);
        return articleMapper.toDto(updatedArticle);
    }

    public ArticleDto updateArticleWithImage(String department, String id, ArticleDto request, MultipartFile imageFile) {
        Article article = articleRepository.findById(department, id)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        articleMapper.updateEntityFromDto(request, article);

        Image image = imageService.updateImage(EntityType.ARTICLE, UUID.fromString(id), imageFile, true)
                .orElseThrow(() -> new RuntimeException("Failed to save image"));
        article.setImageUrl(image.getImageUrl());

        if (request.department() != null && !request.department().equals(article.getDepartment())) {
            articleRepository.delete(article);
        }

        Article updatedArticle = articleRepository.save(article);
        return articleMapper.toDto(updatedArticle);
    }
    
    public void deleteArticle(String department, String id) {
        Article article = articleRepository.findById(department, id)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        articleRepository.delete(article);
        UUID entityId = UUID.fromString(article.getId());
        imageService.deleteImageByEntityTypeAndId(EntityType.ARTICLE, entityId, true);
    }
}