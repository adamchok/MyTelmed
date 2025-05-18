package com.mytelmed.service;

import com.mytelmed.mapper.ArticleMapper;
import com.mytelmed.model.dto.ArticleDto;
import com.mytelmed.model.dto.request.CreateArticleRequestDto;
import com.mytelmed.model.entity.Article;
import com.mytelmed.repository.ArticleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class ArticleService {
    private final ArticleRepository articleRepository;
    private final ArticleMapper articleMapper;

    public ArticleService(ArticleRepository articleRepository, ArticleMapper articleMapper) {
        this.articleRepository = articleRepository;
        this.articleMapper = articleMapper;
    }
    
    public ArticleDto createArticle(CreateArticleRequestDto request) {
        Article article = articleMapper.toEntity(request);
        article.setId(UUID.randomUUID().toString());
        article.setCreatedAt(Instant.now());
        article.setUpdatedAt(Instant.now());
        
        Article savedArticle = articleRepository.save(article);
        return articleMapper.toDto(savedArticle);
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
    
    public ArticleDto updateArticle(String department, String id, CreateArticleRequestDto request) {
        Article existingArticle = articleRepository.findById(department, id)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        
        articleMapper.updateEntityFromDto(request, existingArticle);
        
        Article updatedArticle = articleRepository.save(existingArticle);
        return articleMapper.toDto(updatedArticle);
    }
    
    public void deleteArticle(String department, String id) {
        articleRepository.delete(department, id);
    }
}