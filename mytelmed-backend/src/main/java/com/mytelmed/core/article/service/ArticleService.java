package com.mytelmed.core.article.service;

import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.core.article.dto.CreateArticleRequestDto;
import com.mytelmed.core.article.entity.Article;
import com.mytelmed.core.speciality.entity.Speciality;
import com.mytelmed.core.speciality.service.SpecialityService;
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

import java.util.ArrayList;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.List;


@Slf4j
@Service
public class ArticleService {
    private final DynamoDbTable<Article> articleTable;
    private final SpecialityService specialityService;

    public ArticleService(DynamoDbTable<Article> articleTable, SpecialityService specialityService) {
        this.articleTable = articleTable;
        this.specialityService = specialityService;
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

    public Optional<Article> getArticleById(UUID id) {
        Map<String, AttributeValue> expressionValues = new HashMap<>();
        expressionValues.put(":id", AttributeValue.builder().s(id.toString()).build());

        Expression filterExpression = Expression.builder()
                .expression("id = :id")
                .expressionValues(expressionValues)
                .build();

        ScanEnhancedRequest request = ScanEnhancedRequest.builder()
                .filterExpression(filterExpression)
                .build();

        return articleTable.scan(request).items().stream().findFirst();
    }

    public List<Article> getAllArticles() {
        PageIterable<Article> articles = articleTable.scan();
        List<Article> result = new ArrayList<>();
        articles.items().forEach(result::add);
        return result;
    }

    public List<Article> getArticlesByDepartment(String department) {
        QueryEnhancedRequest request = QueryEnhancedRequest.builder()
                .queryConditional(QueryConditional.keyEqualTo(Key.builder()
                        .partitionValue(department)
                        .build()))
                .build();

        PageIterable<Article> articles = articleTable.query(request);
        List<Article> result = new ArrayList<>();
        articles.items().forEach(result::add);
        return result;
    }

    public void updateArticle(Article article) {
        article.setUpdatedAt(Instant.now());
        articleTable.updateItem(article);
    }
}
