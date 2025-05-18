package com.mytelmed.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;
import java.time.Instant;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DynamoDbBean
public class QnA {
    private String id;
    private String question;
    private String answer;
    private String department;
    private String answeredBy;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastAnsweredAt;

    @DynamoDbPartitionKey
    public String getDepartment() {
        return department;
    }

    @DynamoDbSortKey
    public String getId() {
        return id;
    }
}
