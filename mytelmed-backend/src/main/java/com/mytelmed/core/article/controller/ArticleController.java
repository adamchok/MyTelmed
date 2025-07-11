package com.mytelmed.core.article.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.article.dto.ArticleDto;
import com.mytelmed.core.article.dto.CreateArticleRequestDto;
import com.mytelmed.core.article.dto.UpdateArticleRequestDto;
import com.mytelmed.core.article.entity.Article;
import com.mytelmed.core.article.mapper.ArticleMapper;
import com.mytelmed.core.article.service.ArticleService;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.image.service.ImageService;
import com.mytelmed.core.statistics.entity.ContentView;
import com.mytelmed.core.statistics.service.StatisticsService;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;


@Slf4j
@RestController
@RequestMapping("/api/v1/article")
public class ArticleController {
    private final ArticleService articleService;
    private final ArticleMapper articleMapper;
    private final StatisticsService statisticsService;
    private final AwsS3Service awsS3Service;
    private final ImageService imageService;

    public ArticleController(ArticleService articleService, ArticleMapper articleMapper,
                             StatisticsService statisticsService, AwsS3Service awsS3Service, ImageService imageService) {
        this.articleService = articleService;
        this.articleMapper = articleMapper;
        this.statisticsService = statisticsService;
        this.awsS3Service = awsS3Service;
        this.imageService = imageService;
    }

    // Open endpoint
    @GetMapping("/{articleId}")
    public ResponseEntity<ApiResponse<ArticleDto>> getArticleById(
            @PathVariable UUID articleId,
            @AuthenticationPrincipal Account account,
            HttpServletRequest request) {
        log.debug("Received request to get article by ID: {}", articleId);

        Article article = articleService.findArticleById(articleId);
        ArticleDto articleDto = articleMapper.toDto(article, imageService, awsS3Service);

        // Track content view for analytics
        statisticsService.trackContentView(
                articleId.toString(),
                ContentView.ContentType.ARTICLE,
                account != null ? account.getId() : null,
                request.getSession().getId(),
                request.getRemoteAddr(),
                request.getHeader("User-Agent")
        );

        return ResponseEntity.ok(ApiResponse.success(articleDto));
    }

    // Open endpoint
    @GetMapping
    public ResponseEntity<ApiResponse<List<ArticleDto>>> getAllArticles(@RequestParam(required = false) String subject) {
        if (subject != null && !subject.trim().isEmpty()) {
            log.debug("Received request to get articles by subject: {}", subject);
            List<Article> articleList = articleService.findArticlesBySubject(subject);
            List<ArticleDto> articleDtoList = articleList.stream()
                    .map((article) -> articleMapper.toDto(article, imageService, awsS3Service))
                    .toList();
            return ResponseEntity.ok(ApiResponse.success(articleDtoList));
        } else {
            log.debug("Received request to get all articles");
            List<Article> articleList = articleService.findAllArticles();
            List<ArticleDto> articleDtoList = articleList.stream()
                    .map((article) -> articleMapper.toDto(article, imageService, awsS3Service))
                    .toList();
            return ResponseEntity.ok(ApiResponse.success(articleDtoList));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> createArticle(@RequestBody CreateArticleRequestDto request) {
        log.debug("Received request to create article: {}", request);

        articleService.createArticle(request);
        return ResponseEntity.ok(ApiResponse.success("Article created successfully"));
    }

    @PostMapping(value = "/{articleId}/thumbnail", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateArticleThumbnail(
            @PathVariable UUID articleId,
            @RequestPart("thumbnail") MultipartFile thumbnailFile) {
        log.info("Received request to upload thumbnail for article with ID: {}", articleId);

        articleService.uploadThumbnail(articleId, thumbnailFile);
        return ResponseEntity.ok(ApiResponse.success("Article thumbnail uploaded successfully"));
    }

    @PutMapping("/{articleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateArticle(
            @PathVariable UUID articleId,
            @RequestBody UpdateArticleRequestDto request
    ) {
        log.debug("Received request to update article with ID: {}", articleId);

        articleService.updateArticle(articleId, request);
        return ResponseEntity.ok(ApiResponse.success("Article updated successfully"));
    }

    @DeleteMapping("/{articleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteArticle(@PathVariable UUID articleId) {
        log.debug("Received request to delete article with ID: {}", articleId);

        articleService.deleteArticle(articleId);
        return ResponseEntity.ok(ApiResponse.success("Article deleted successfully"));
    }
}
