package com.mytelmed.core.article.service;

import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.core.article.dto.CreateArticleRequestDto;
import com.mytelmed.core.article.dto.UpdateArticleRequestDto;
import com.mytelmed.core.article.entity.Article;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
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

    public ArticleService(DynamoDbTable<Article> articleTable) {
        this.articleTable = articleTable;
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

    public List<Article> findArticlesBySpeciality(String speciality) {
        Key key = Key.builder()
                .partitionValue(speciality)
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
                .speciality(request.speciality())
                .content(request.content())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        articleTable.putItem(article);
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
                .partitionValue(article.getSpeciality())
                .sortValue(article.getId())
                .build();

        articleTable.deleteItem(key);
    }
}
