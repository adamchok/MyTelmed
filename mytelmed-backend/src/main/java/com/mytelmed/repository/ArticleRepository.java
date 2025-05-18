package com.mytelmed.repository;

import com.mytelmed.model.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.PageIterable;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Repository
public class ArticleRepository {
    private final DynamoDbTable<Article> articleTable;

    public ArticleRepository(DynamoDbTable<Article> articleTable) {
        this.articleTable = articleTable;
    }

    public Article save(Article article) {
        articleTable.putItem(article);
        return article;
    }

    public Optional<Article> findById(String department, String id) {
        Key key = Key.builder()
                .partitionValue(department)
                .sortValue(id)
                .build();
        return Optional.ofNullable(articleTable.getItem(key));
    }

    public Page<Article> findByDepartment(String department, Pageable pageable) {
        QueryConditional queryConditional = QueryConditional
                .keyEqualTo(Key.builder()
                        .partitionValue(department)
                        .build());

        List<Article> allArticles = articleTable.query(queryConditional)
                .items()
                .stream()
                .collect(Collectors.toList());

        int total = allArticles.size();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), total);

        List<Article> paginatedList = allArticles.subList(start, end);

        return new PageImpl<>(paginatedList, pageable, total);
    }

    public Page<Article> findAll(Pageable pageable) {
        PageIterable<Article> scan = articleTable.scan();
        List<Article> allArticles = scan.items().stream().collect(Collectors.toList());

        int total = allArticles.size();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), total);

        List<Article> paginatedList = allArticles.subList(start, end);

        return new PageImpl<>(paginatedList, pageable, total);
    }

    public void delete(String department, String id) {
        Key key = Key.builder()
                .partitionValue(department)
                .sortValue(id)
                .build();
        articleTable.deleteItem(key);
    }
}
