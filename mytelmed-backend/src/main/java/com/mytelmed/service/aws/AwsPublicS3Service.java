package com.mytelmed.service.aws;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentials;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import java.io.IOException;
import java.util.UUID;


@Service
@Slf4j
public class AwsPublicS3Service {
    private final String ACCESS_KEY;
    private final String SECRET_KEY;
    private final String BUCKET_NAME;

    public AwsPublicS3Service(
            @Value("${aws.accessKey}") String accessKey,
            @Value("${aws.secretKey}") String secretKey,
            @Value("${aws.s3.public.bucket-name}") String bucketName) {
        this.ACCESS_KEY = accessKey;
        this.SECRET_KEY = secretKey;
        this.BUCKET_NAME = bucketName;
    }

    private S3Client getClient() {
        AwsCredentials credentials = AwsBasicCredentials.create(ACCESS_KEY, SECRET_KEY);
        return S3Client.builder()
                .credentialsProvider(() -> credentials)
                .region(Region.AP_SOUTHEAST_1)
                .build();
    }

    private byte[] getObjectBytes(String keyName) {
        S3Client s3 = getClient();
        try {
            GetObjectRequest request = GetObjectRequest
                    .builder()
                    .key(keyName)
                    .bucket(BUCKET_NAME)
                    .build();
            ResponseBytes<GetObjectResponse> objectBytes = s3.getObjectAsBytes(request);
            return objectBytes.asByteArray();
        } catch (S3Exception ex) {
            log.error("Error downloading object:", ex);
            throw ex;
        }
    }

    private void putObject(byte[] data, String objectKey) {
        S3Client s3 = getClient();
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(BUCKET_NAME)
                    .key(objectKey)
                    .build();
            s3.putObject(request, RequestBody.fromBytes(data));
        } catch (S3Exception ex) {
            log.error("Error uploading object:", ex);
            throw ex;
        }
    }

    private void deleteObject(String objectKey) {
        S3Client s3 = getClient();
        try {
            DeleteObjectRequest request = DeleteObjectRequest.builder()
                    .bucket(BUCKET_NAME)
                    .key(objectKey)
                    .build();
            s3.deleteObject(request);
        } catch (S3Exception ex) {
            log.error("Error deleting object:", ex);
            throw ex;
        }
    }

    /**
     * Saves the given file to an AWS S3 bucket in the specified folder structure and returns the public URL of the uploaded file.
     *
     * @param folderName the name of the folder in the S3 bucket where the file should be stored
     * @param entityId the unique identifier used to distinguish the entity with which the file is associated
     * @param file the file to be uploaded to the S3 bucket
     * @return the public URL of the uploaded file in the S3 bucket
     * @throws IOException if an error occurs while reading the file or uploading it to S3
     */
    public String saveFileToS3AndGetUrl(String folderName, String entityId, MultipartFile file) throws IOException {
        String originalFileName = file.getOriginalFilename();
        String newFileName = generateRandomFileName(originalFileName);
        String key = folderName + "/" + entityId + "/images/" + newFileName;

        putObject(file.getBytes(), key);

        return "https://" + BUCKET_NAME + ".s3.amazonaws.com/" + key;
    }

    public String generateRandomFileName(String originalFileName) {
        String fileExtension = StringUtils.hasText(originalFileName) ?
                originalFileName.substring(originalFileName.lastIndexOf("."))
                : "";
        return UUID.randomUUID() + fileExtension;
    }
}
