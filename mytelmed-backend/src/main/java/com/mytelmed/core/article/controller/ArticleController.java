package com.mytelmed.core.article.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.article.dto.ArticleDto;
import com.mytelmed.core.article.dto.CreateArticleRequestDto;
import com.mytelmed.core.article.dto.PaginatedArticles;
import com.mytelmed.core.article.dto.UpdateArticleRequestDto;
import com.mytelmed.core.article.entity.Article;
import com.mytelmed.core.article.mapper.ArticleMapper;
import com.mytelmed.core.article.service.ArticleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import java.util.Map;
import java.util.UUID;


@RestController
@RequestMapping("/article")
public class ArticleController {
    private final ArticleService articleService;
    private final ArticleMapper articleMapper;

    public ArticleController(ArticleService articleService, ArticleMapper articleMapper) {
        this.articleService = articleService;
        this.articleMapper = articleMapper;
    }

    @GetMapping("/{articleId}")
    public ResponseEntity<ApiResponse<ArticleDto>> getArticleById(@PathVariable UUID articleId) {
        Article article = articleService.findArticleById(articleId);
        ArticleDto articleDto = articleMapper.toDto(article);
        return ResponseEntity.ok(ApiResponse.success(articleDto));
    }

    @GetMapping("/{speciality}")
    public ResponseEntity<ApiResponse<PaginatedArticles>> getPaginatedArticlesBySpeciality(
            @PathVariable String speciality,
            @RequestBody Map<String, AttributeValue> exclusiveStartKey,
            @RequestParam(defaultValue = "10") int size
    ) {
        PaginatedArticles paginatedArticles = articleService.findPaginatedArticlesBySpeciality(speciality, exclusiveStartKey, size);
        return ResponseEntity.ok(ApiResponse.success(paginatedArticles));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createArticle(@RequestBody CreateArticleRequestDto request) {
        articleService.createArticle(request);
        return ResponseEntity.ok(ApiResponse.success("Article created successfully"));
    }

    @PutMapping("/{articleId}")
    public ResponseEntity<ApiResponse<Void>> updateArticle(
            @PathVariable UUID articleId,
            @RequestBody UpdateArticleRequestDto request
    ) {
        articleService.updateArticle(articleId, request);
        return ResponseEntity.ok(ApiResponse.success("Article updated successfully"));
    }

    @DeleteMapping("/{articleId}")
    public ResponseEntity<ApiResponse<Void>> deleteArticle(@PathVariable UUID articleId) {
        articleService.deleteArticle(articleId);
        return ResponseEntity.ok(ApiResponse.success("Article deleted successfully"));
    }
}
