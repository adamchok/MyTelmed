package com.mytelmed.infrastructure.aws.service;

import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.infrastructure.aws.dto.S3StorageOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
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
    private final String publicAssetsBucket;
    private final String privateAssetsBucket;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    public AwsS3Service(
            @Value("${aws.s3.public.bucket-name}") String publicAssetsBucket,
            @Value("${aws.s3.private.bucket-name}") String privateAssetsBucket,
            S3Client s3Client, S3Presigner s3Presigner) {
        this.publicAssetsBucket = publicAssetsBucket;
        this.privateAssetsBucket = privateAssetsBucket;
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
    }

    private String generateRandomFileName(String originalFileName) {
        String fileExtension = StringUtils.hasText(originalFileName) ?
                originalFileName.substring(originalFileName.lastIndexOf("."))
                : "";
        return UUID.randomUUID() + fileExtension;
    }

    private String buildObjectKey(S3StorageOptions storageOptions, String originalFileName) {
        String fileName = generateRandomFileName(originalFileName);
        String subfolder = storageOptions.publicAccess() ? "images" : "files";

        return String.format("%s/%s/%s/%s",
                storageOptions.folderName(),
                storageOptions.entityId(),
                subfolder,
                fileName);
    }

    public String getFileUrl(String key, boolean isPublicAccess, Duration expiration) throws S3Exception {
        String bucket = isPublicAccess ? publicAssetsBucket : privateAssetsBucket;

        try {
            if (isPublicAccess) {
                return String.format("https://%s.s3.amazonaws.com/%s", publicAssetsBucket, key);
            } else {
                GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                        .bucket(privateAssetsBucket)
                        .key(key)
                        .build();

                GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                        .signatureDuration(expiration)
                        .getObjectRequest(getObjectRequest)
                        .build();

                URL presignedUrl = s3Presigner.presignGetObject(presignRequest).url();
                return presignedUrl.toString();
            }
        } catch (S3Exception e) {
            log.error("S3 error generating pre-signed URL for key: {} from bucket: {}. Error code: {}",
                    key, bucket, e.awsErrorDetails().errorCode(), e);
            throw e;
        } catch (Exception e) {
            log.error("Error getting file URL: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Uploads a file to S3 and returns its URL.
     *
     * @param storageOptions options for storing the file
     * @param file the file to upload
     * @return the URL of the uploaded file
     * @throws IOException if the file cannot be read
     * @throws S3Exception if the file cannot be uploaded to S3
     */
    public String uploadFileAndGetKey(S3StorageOptions storageOptions, MultipartFile file) throws IOException, S3Exception, InvalidInputException {
        if (file == null || file.isEmpty()) {
            log.warn("Attempted to upload empty or null file to S3 for entity: {}", storageOptions.entityId());
            throw new InvalidInputException("File cannot be null or empty");
        }

        String originalFileName = file.getOriginalFilename();
        String key = buildObjectKey(storageOptions, originalFileName);
        String bucket = storageOptions.publicAccess() ? publicAssetsBucket : privateAssetsBucket;

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();

            s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));

            return key;
        } catch (S3Exception e) {
            log.error("S3 error uploading object with key: {} to bucket: {}. Error code: {}", key, bucket, e.awsErrorDetails().errorCode(), e);
            throw e;
        } catch (IOException e) {
            log.error("Error reading file from multipart: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Error saving file: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Updates an existing file in S3 with new content.
     * This method replaces the content at the specified key with the new file.
     *
     * @param key the existing object key to update
     * @param isPublicAccess whether the file is in the public bucket
     * @param file the new file content to upload
     * @return the same key if the update was successful
     * @throws IOException if the file cannot be read
     * @throws S3Exception if the file cannot be uploaded to S3
     */
    public String updateFile(String key, boolean isPublicAccess, MultipartFile file) throws IOException, S3Exception {
        if (key == null || key.isEmpty()) {
            log.warn("Attempted to update file with null or empty key");
            throw new InvalidInputException("S3 object key cannot be null or empty");
        }

        if (file == null || file.isEmpty()) {
            log.warn("Attempted to update with empty or null file for key: {}", key);
            throw new InvalidInputException("Update file cannot be null or empty");
        }

        String bucket = isPublicAccess ? publicAssetsBucket : privateAssetsBucket;

        try {
            try {
                s3Client.headObject(HeadObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .build());
            } catch (S3Exception e) {
                log.error("Cannot update file that doesn't exist in S3. Key: {} in bucket: {}", key, bucket);
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
     * Downloads a file from S3.
     *
     * @param key the object key
     * @param isPublicAccess whether the file is in the public bucket
     * @return the file contents as a byte array
     * @throws S3Exception if the file cannot be downloaded from S3
     */
    public byte[] downloadFile(String key, boolean isPublicAccess) throws S3Exception {
        try {
            GetObjectRequest request = GetObjectRequest.builder()
                    .bucket(isPublicAccess ? publicAssetsBucket : privateAssetsBucket)
                    .key(key)
                    .build();

            ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(request);
            return objectBytes.asByteArray();
        } catch (S3Exception e) {
            log.error("Error downloading file from S3: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Error downloading file: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Deletes a file from S3.
     *
     * @param key the object key
     * @param isPublicAccess whether the file is in the public bucket
     * @throws S3Exception if the file cannot be deleted from S3 or if the bucket does not exist
     */
    public void deleteFile(String key, boolean isPublicAccess) throws S3Exception {
        try {
            DeleteObjectRequest request = DeleteObjectRequest.builder()
                    .bucket(isPublicAccess ? publicAssetsBucket : privateAssetsBucket)
                    .key(key)
                    .build();

            s3Client.deleteObject(request);
        } catch (S3Exception e) {
            log.error("Error deleting file from S3: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Error deleting file: {}", e.getMessage(), e);
            throw e;
        }
    }
}
