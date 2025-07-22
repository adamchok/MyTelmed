package com.mytelmed.core.article.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;
import java.time.Instant;

@DynamoDbBean
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Article {
    private String id;
    private String title;
    private String subject;
    private String content;
    private String imageId;
    private Instant createdAt;
    private Instant updatedAt;

    @DynamoDbSortKey
    @DynamoDbAttribute("id")
    public String getId() {
        return id;
    }

    @DynamoDbAttribute("title")
    public String getTitle() {
        return title;
    }

    @DynamoDbPartitionKey
    @DynamoDbAttribute("subject")
    public String getSubject() {
        return subject;
    }

    @DynamoDbAttribute("content")
    public String getContent() {
        return content;
    }

    @DynamoDbAttribute("image_id")
    public String getImageId() {
        return imageId;
    }

    @DynamoDbAttribute("createdAt")
    public Instant getCreatedAt() {
        return createdAt;
    }

    @DynamoDbAttribute("updatedAt")
    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
