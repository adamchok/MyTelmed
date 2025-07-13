package com.mytelmed.infrastructure.aws.service;

import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.constant.file.FileType;
import com.mytelmed.infrastructure.aws.dto.S3StorageOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import java.io.IOException;
import java.net.URL;
import java.time.Duration;
import java.util.UUID;


@Slf4j
@Service
public class AwsS3Service {
    private final String bucket;
    private final String cloudFrontDomainName;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    // Presigned URL expiry durations
    private static final Duration IMAGE_EXPIRY = Duration.ofSeconds(5);
    private static final Duration DOCUMENT_EXPIRY = Duration.ofMinutes(10);

    public AwsS3Service(
            @Value("${aws.s3.bucket.name}") String bucket,
            @Value("${aws.cloudfront.domain-name}") String cloudFrontDomainName,
            S3Client s3Client, S3Presigner s3Presigner) {
        this.bucket = bucket;
        this.cloudFrontDomainName = cloudFrontDomainName;
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
    }

    public String generateVideoUrl(String key) {
        if (key.contains("tutorial")) {
            return String.format("https://%s/%s", cloudFrontDomainName, key);
        }
        return null;
    }

    /**
     * Generates a presigned URL for viewing images (5 seconds expiry).
     *
     * @param key the S3 object key
     * @return the presigned URL
     * @throws S3Exception if there's an S3 error
     */
    public String generatePresignedViewUrl(String key) throws S3Exception {
        return generatePresignedUrl(key, FileType.IMAGE);
    }

    /**
     * Generates a presigned URL for documents (10 minutes expiry).
     *
     * @param key the S3 object key
     * @return the presigned URL
     * @throws S3Exception if there's an S3 error
     */
    public String generatePresignedDocumentUrl(String key) throws S3Exception {
        return generatePresignedUrl(key, FileType.DOCUMENT);
    }

    /**
     * Uploads a file to S3 and returns its key.
     * All files are stored in the private assets bucket.
     *
     * @param storageOptions options for storing the file
     * @param file           the file to upload
     * @return the S3 object key
     * @throws IOException if the file cannot be read
     * @throws S3Exception if the file cannot be uploaded to S3
     */
    public String uploadFileAndGetKey(S3StorageOptions storageOptions, MultipartFile file)
            throws IOException, S3Exception, InvalidInputException {
        if (file == null || file.isEmpty()) {
            log.warn("Attempted to upload empty or null file to S3 for entity: {}", storageOptions.entityId());
            throw new InvalidInputException("File cannot be null or empty");
        }

        String originalFileName = file.getOriginalFilename();
        String key = buildObjectKey(storageOptions, originalFileName);

        if (storageOptions.fileType().equals(FileType.DOCUMENT) && originalFileName != null) {
            if (!originalFileName.endsWith(".pdf")) {
                throw new InvalidInputException("File must be a PDF");
            }
        }

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType("application/pdf")
                    .build();

            s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));
            log.info("Successfully uploaded file to S3 with key: {}", key);

            return key;
        } catch (S3Exception e) {
            log.error("S3 error uploading object with key: {} to bucket: {}. Error code: {}",
                    key, bucket, e.awsErrorDetails().errorCode(), e);
            throw e;
        } catch (IOException e) {
            log.error("Error reading file from multipart: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Error saving file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }

    /**
     * Updates an existing file in S3 with new content.
     * This method replaces the content at the specified key with the new file.
     *
     * @param key  the existing object key to update
     * @param file the new file content to upload
     * @return the same key if the update was successful
     * @throws IOException if the file cannot be read
     * @throws S3Exception if the file cannot be uploaded to S3
     */
    public String updateFile(String key, MultipartFile file) throws IOException, S3Exception {
        if (key == null || key.isEmpty()) {
            log.warn("Attempted to update file with null or empty key");
            throw new InvalidInputException("S3 object key cannot be null or empty");
        }

        if (file == null || file.isEmpty()) {
            log.warn("Attempted to update with empty or null file for key: {}", key);
            throw new InvalidInputException("Update file cannot be null or empty");
        }

        try {
            // Check if file exists
            try {
                s3Client.headObject(HeadObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .build());
            } catch (S3Exception e) {
                log.error("Cannot update file that doesn't exist in S3. Key: {} in bucket: {}", key,
                        bucket);
                throw new IllegalArgumentException("File does not exist in S3", e);
            }

            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();

            log.debug("Updating existing S3 object at key: {} in bucket: {}", key, bucket);
            s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));

            return key;
        } catch (S3Exception e) {
            log.error("S3 error updating object with key: {} in bucket: {}. Error code: {}",
                    key, bucket, e.awsErrorDetails().errorCode(), e);
            throw e;
        } catch (IOException e) {
            log.error("Error reading update file content: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Error updating file in S3: {}", e.getMessage(), e);
            throw new RuntimeException("Unexpected error updating file in S3", e);
        }
    }

    /**
     * Deletes a file from S3.
     *
     * @param key the object key
     * @throws S3Exception if the file cannot be deleted from S3
     */
    public void deleteFile(String key) throws S3Exception {
        if (key == null || key.isEmpty()) {
            throw new InvalidInputException("S3 object key cannot be null or empty");
        }

        try {
            DeleteObjectRequest request = DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();

            s3Client.deleteObject(request);
            log.info("Successfully deleted file from S3 with key: {}", key);
        } catch (S3Exception e) {
            log.error("Error deleting file from S3: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Error deleting file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete file from S3", e);
        }
    }

    private String generatePresignedUrl(String key, FileType fileType) throws S3Exception {
        if (key == null || key.isEmpty()) {
            throw new InvalidInputException("S3 object key cannot be null or empty");
        }

        try {
            // Determine expiry duration based on file type
            Duration expiry = switch (fileType) {
                case IMAGE -> IMAGE_EXPIRY;
                case DOCUMENT -> DOCUMENT_EXPIRY;
                case VIDEO -> DOCUMENT_EXPIRY; // Non-tutorial videos get document expiry
            };

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(expiry)
                    .getObjectRequest(getObjectRequest)
                    .build();

            URL presignedUrl = s3Presigner.presignGetObject(presignRequest).url();
            return presignedUrl.toString();
        } catch (S3Exception e) {
            log.error("S3 error generating pre-signed URL for key: {} from bucket: {}. Error code: {}",
                    key, bucket, e.awsErrorDetails().errorCode(), e);
            throw e;
        } catch (Exception e) {
            log.error("Error generating pre-signed URL: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate pre-signed URL", e);
        }
    }

    private String generateRandomFileName(String originalFileName) {
        String fileExtension = StringUtils.hasText(originalFileName)
                ? originalFileName.substring(originalFileName.lastIndexOf("."))
                : "";
        return UUID.randomUUID() + fileExtension;
    }

    private String buildObjectKey(S3StorageOptions storageOptions, String originalFileName) {
        String fileName = generateRandomFileName(originalFileName);

        return String.format("%s/%s/%s/%s",
                storageOptions.fileType().name().toLowerCase(),
                storageOptions.folderName(),
                storageOptions.entityId(),
                fileName);
    }
}
