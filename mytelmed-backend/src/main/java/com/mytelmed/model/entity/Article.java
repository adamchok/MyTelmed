package com.mytelmed.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

import java.time.Instant;
import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DynamoDbBean
public class Article {
    private String id;
    private String title;
    private String content;
    private String department;
    private String author;
    private Instant createdAt;
    private Instant updatedAt;
    private String imageUrl;
    private boolean featured;
    private List<String> tags;
    
    @DynamoDbPartitionKey
    public String getDepartment() {
        return department;
    }
    
    @DynamoDbSortKey
    public String getId() {
        return id;
    }
}