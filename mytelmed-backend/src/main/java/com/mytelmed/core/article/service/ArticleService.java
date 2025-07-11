package com.mytelmed.core.article.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.file.ImageType;
import com.mytelmed.common.event.image.ImageDeletedEvent;
import com.mytelmed.core.article.dto.CreateArticleRequestDto;
import com.mytelmed.core.article.dto.UpdateArticleRequestDto;
import com.mytelmed.core.article.entity.Article;
import com.mytelmed.core.image.entity.Image;
import com.mytelmed.core.image.service.ImageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Expression;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.PageIterable;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;


@Slf4j
@Service
public class ArticleService {
    private final DynamoDbTable<Article> articleTable;
    private final ImageService imageService;
    private final ApplicationEventPublisher applicationEventPublisher;

    public ArticleService(DynamoDbTable<Article> articleTable, ImageService imageService, ApplicationEventPublisher applicationEventPublisher) {
        this.articleTable = articleTable;
        this.imageService = imageService;
        this.applicationEventPublisher = applicationEventPublisher;
    }

    public Article findArticleById(UUID id) throws ResourceNotFoundException {
        Map<String, AttributeValue> expressionValues = new HashMap<>();
        expressionValues.put(":id", AttributeValue.builder().s(id.toString()).build());

        Expression filterExpression = Expression.builder()
                .expression("id = :id")
                .expressionValues(expressionValues)
                .build();

        ScanEnhancedRequest request = ScanEnhancedRequest.builder()
                .filterExpression(filterExpression)
                .build();

        return articleTable.scan(request).items().stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));
    }

    public List<Article> findAllArticles() {
        // Create a scan request without any filters (retrieves everything)
        ScanEnhancedRequest request = ScanEnhancedRequest.builder().build();

        // Perform the scan operation, which returns paginated results
        PageIterable<Article> pages = articleTable.scan(request);

        // Flatten all pages into a single list of items
        return pages.stream()
                .flatMap(page -> page.items().stream())
                .collect(Collectors.toList());
    }

    public List<Article> findArticlesBySubject(String subject) {
        Key key = Key.builder()
                .partitionValue(subject)
                .build();

        QueryEnhancedRequest request = QueryEnhancedRequest.builder()
                .queryConditional(QueryConditional.keyEqualTo(key))
                .build();

        PageIterable<Article> pages = articleTable.query(request);

        List<Article> allArticles = new ArrayList<>();
        pages.stream().forEach(page -> allArticles.addAll(page.items()));

        return allArticles;
    }

    public void createArticle(CreateArticleRequestDto request) throws ResourceNotFoundException {
        Article article = Article.builder()
                .id(UUID.randomUUID().toString())
                .title(request.title())
                .subject(request.subject())
                .content(request.content())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        articleTable.putItem(article);
    }

    public void uploadThumbnail(UUID articleId, MultipartFile thumbnailImageFile) throws AppException {
        log.debug("Uploading thumbnail for article with ID: {}", articleId);

        Article article = findArticleById(articleId);

        if (thumbnailImageFile == null || thumbnailImageFile.isEmpty()) {
            throw new InvalidInputException("Article thumbnail image is required");
        }

        try {
            Image image = imageService.updateAndGetImage(ImageType.ARTICLE, articleId, thumbnailImageFile);
            article.setImageId(image.getId().toString());

            articleTable.updateItem(article);

            log.info("Uploaded thumbnail for article with ID: {}", articleId);
        } catch (Exception e) {
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            log.error("Unexpected error while uploading thumbnail for article: {}", articleId, e);
            throw new AppException("Failed to upload article thumbnail");
        }
    }

    public void updateArticle(UUID articleId, UpdateArticleRequestDto request) throws ResourceNotFoundException {
        Article article = findArticleById(articleId);

        article.setTitle(request.title());
        article.setContent(request.content());
        article.setUpdatedAt(Instant.now());

        articleTable.updateItem(article);
    }

    public void deleteArticle(UUID id) throws ResourceNotFoundException {
        Article article = findArticleById(id);

        Key key = Key.builder()
                .partitionValue(article.getSubject())
                .sortValue(article.getId())
                .build();

        articleTable.deleteItem(key);

        if (article.getImageId() == null) {
            return;
        }

        Image image = imageService.getImageById(id);
        
        if (image.getImageKey() != null) {
            applicationEventPublisher.publishEvent(new ImageDeletedEvent(id, image.getImageKey()));
        }
    }
}
