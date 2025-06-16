package com.mytelmed.core.article.service;

import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.core.article.dto.CreateArticleRequestDto;
import com.mytelmed.core.article.dto.PaginatedArticles;
import com.mytelmed.core.article.dto.UpdateArticleRequestDto;
import com.mytelmed.core.article.entity.Article;
import com.mytelmed.core.speciality.entity.Speciality;
import com.mytelmed.core.speciality.service.SpecialityService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Expression;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.*;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.UUID;


@Slf4j
@Service
public class ArticleService {
    private final DynamoDbTable<Article> articleTable;
    private final SpecialityService specialityService;

    public ArticleService(DynamoDbTable<Article> articleTable, SpecialityService specialityService) {
        this.articleTable = articleTable;
        this.specialityService = specialityService;
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
                .orElseThrow(() -> new ResourceNotFoundException("Article not found")) ;
    }

    public PaginatedArticles findPaginatedArticlesBySpeciality(String speciality, Map<String, AttributeValue> exclusiveStartKey, int pageSize) {
        Key key = Key.builder()
                .partitionValue(speciality)
                .build();

        QueryEnhancedRequest.Builder requestBuilder = QueryEnhancedRequest.builder()
                .queryConditional(QueryConditional.keyEqualTo(key))
                .limit(pageSize);

        if (exclusiveStartKey != null && !exclusiveStartKey.isEmpty()) {
            requestBuilder.exclusiveStartKey(exclusiveStartKey);
        }

        PageIterable<Article> pages = articleTable.query(requestBuilder.build());

        Iterator<Page<Article>> iterator = pages.iterator();
        if (!iterator.hasNext()) {
            return new PaginatedArticles(Collections.emptyList(), null);
        }

        Page<Article> page = iterator.next();
        return new PaginatedArticles(page.items(), page.lastEvaluatedKey());
    }

    public void createArticle(CreateArticleRequestDto request) throws ResourceNotFoundException {
        Speciality speciality = specialityService.findSpecialityById(request.specialityId());

        Article article = Article.builder()
                .id(UUID.randomUUID())
                .title(request.title())
                .speciality(speciality.getName())
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
                .sortValue(article.getId().toString())
                .build();

        articleTable.deleteItem(key);
    }
}
