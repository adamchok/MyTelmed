package com.mytelmed.core.article.dto;

import com.mytelmed.core.article.entity.Article;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.util.List;
import java.util.Map;


public record PaginatedArticles(
        List<Article> items,
        Map<String, AttributeValue> lastEvaluatedKey
) {
}
