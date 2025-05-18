package com.mytelmed.config;

import com.mytelmed.model.entity.Article;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentials;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.s3.S3Client;


@Configuration
public class AWSConfig {
    private final AwsCredentials CREDENTIALS;
    private final Region REGION;
    private final String DYNAMO_DB_TABLE_NAME;

    public AWSConfig(@Value("${aws.accessKey}") String accessKey,
                     @Value("${aws.secretKey}") String secretKey,
                     @Value("${aws.region}") String region,
                     @Value("${aws.dynamodb.article.table-name}") String dynamoDbTableName) {
        this.CREDENTIALS = AwsBasicCredentials.create(accessKey, secretKey);
        this.REGION = Region.of(region);
        this.DYNAMO_DB_TABLE_NAME = dynamoDbTableName;
    }

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .credentialsProvider(() -> CREDENTIALS)
                .region(REGION)
                .build();
    }

    @Bean
    public DynamoDbClient dynamoDbClient() {
        return DynamoDbClient.builder()
                .credentialsProvider(() -> CREDENTIALS)
                .region(REGION)
                .build();
    }

    @Bean
    public DynamoDbEnhancedClient dynamoDbEnhancedClient(DynamoDbClient dynamoDbClient) {
        return DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();
    }

    @Bean
    public DynamoDbTable<Article> articleTable(DynamoDbEnhancedClient enhancedClient) {
        return enhancedClient.table(DYNAMO_DB_TABLE_NAME, TableSchema.fromBean(Article.class));
    }
}
