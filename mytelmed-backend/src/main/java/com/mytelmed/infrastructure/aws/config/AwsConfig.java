package com.mytelmed.infrastructure.aws.config;

import com.mytelmed.core.article.entity.Article;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;


@Configuration
public class AwsConfig {
    private final String articleTableName;
    private final Region region;
    private final StaticCredentialsProvider credentialsProvider;

    public AwsConfig(@Value("${aws.accessKey}") String accessKey,
                     @Value("${aws.secretKey}") String secretKey,
                     @Value("${aws.region}") String region,
                     @Value("${aws.dynamodb.article.table-name}") String articleTableName) {
        this.credentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));
        this.region = Region.of(region);
        this.articleTableName = articleTableName;
    }

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .credentialsProvider(credentialsProvider)
                .region(region)
                .build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
                .credentialsProvider(credentialsProvider)
                .region(region)
                .build();
    }

    @Bean
    public DynamoDbClient dynamoDbClient() {
        return DynamoDbClient.builder()
                .credentialsProvider(credentialsProvider)
                .region(region)
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
        return enhancedClient.table(articleTableName, TableSchema.fromBean(Article.class));
    }
}