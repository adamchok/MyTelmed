package com.mytelmed.service.aws;

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
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.UUID;


@Service
@Slf4j
public class AwsS3Service {
    private final String PUBLIC_BUCKET_NAME;
    private final String PRIVATE_BUCKET_NAME;
    private final S3Client S3_CLIENT;

    public AwsS3Service(
            @Value("${aws.s3.public.bucket-name}") String publicBucketName,
            @Value("${aws.s3.private.bucket-name}") String privateBucketName,
            S3Client s3Client) {
        this.PUBLIC_BUCKET_NAME = publicBucketName;
        this.PRIVATE_BUCKET_NAME = privateBucketName;
        this.S3_CLIENT = s3Client;
    }

    private byte[] getObjectBytes(String keyName, boolean isPublic) {
        try {
            GetObjectRequest request = GetObjectRequest
                    .builder()
                    .key(keyName)
                    .bucket(isPublic ? PUBLIC_BUCKET_NAME : PRIVATE_BUCKET_NAME)
                    .build();
            ResponseBytes<GetObjectResponse> objectBytes = S3_CLIENT.getObjectAsBytes(request);
            return objectBytes.asByteArray();
        } catch (S3Exception ex) {
            log.error("Error downloading object:", ex);
            throw ex;
        }
    }

    private void putObject(byte[] data, String objectKey, boolean isPublic) {
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(isPublic ? PUBLIC_BUCKET_NAME : PRIVATE_BUCKET_NAME)
                    .key(objectKey)
                    .build();
            S3_CLIENT.putObject(request, RequestBody.fromBytes(data));
        } catch (S3Exception ex) {
            log.error("Error uploading object:", ex);
            throw ex;
        }
    }

    private void deleteObject(String objectKey, boolean isPublic) {
        try {
            DeleteObjectRequest request = DeleteObjectRequest.builder()
                    .bucket(isPublic ? PUBLIC_BUCKET_NAME : PRIVATE_BUCKET_NAME)
                    .key(objectKey)
                    .build();
            S3_CLIENT.deleteObject(request);
        } catch (S3Exception ex) {
            log.error("Error deleting object:", ex);
            throw ex;
        }
    }

    private String generateRandomFileName(String originalFileName) {
        String fileExtension = StringUtils.hasText(originalFileName) ?
                originalFileName.substring(originalFileName.lastIndexOf("."))
                : "";
        return UUID.randomUUID() + fileExtension;
    }

    private String extractS3KeyFromUrl(String url, boolean isPublic) {
        String s3BaseUrl = "https://" + (isPublic ? PUBLIC_BUCKET_NAME : PRIVATE_BUCKET_NAME) + ".s3.amazonaws.com/";
        return url.replace(s3BaseUrl, "");
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
    public String saveFileToS3AndGetUrl(String folderName, String entityId, MultipartFile file, boolean isPublic) throws IOException {
        String originalFileName = file.getOriginalFilename();
        String newFileName = generateRandomFileName(originalFileName);
        String key = folderName + "/" + entityId + "/files/" + newFileName;

        putObject(file.getBytes(), key, isPublic);

        return "https://" + (isPublic ? PUBLIC_BUCKET_NAME : PRIVATE_BUCKET_NAME) + ".s3.amazonaws.com/" + key;
    }

    /**
     * Updates an existing file in the S3 bucket by deleting the old file and uploading the new one.
     *
     * @param folderName the folder in which the file is stored
     * @param entityId the ID associated with the file
     * @param oldUrl the url of the old file in S3 to be replaced
     * @param newFile the new file to upload
     * @return the public URL of the updated file
     * @throws IOException if an error occurs during the upload or deletion process
     */
    public String updateFileInS3(String folderName, String entityId, String oldUrl, MultipartFile newFile,
                                 boolean isPublic) throws IOException {
        String oldImageKey = extractS3KeyFromUrl(oldUrl, isPublic);
        deleteObject(oldImageKey, isPublic);

        String newFileName = generateRandomFileName(newFile.getOriginalFilename());
        String newKey = folderName + "/" + entityId + "/files/" + newFileName;

        putObject(newFile.getBytes(), newKey, isPublic);

        return "https://" + (isPublic ? PUBLIC_BUCKET_NAME : PRIVATE_BUCKET_NAME) + ".s3.amazonaws.com/" + newKey;
    }


    /**
     * Deletes a file from the S3 bucket using its public URL.
     *
     * @param url the public URL of the file to be deleted from the S3 bucket
     *
     * @throws S3Exception if an error occurs while deleting the file from S3
     */
    public void deleteFileInS3ByUrl(String url, boolean isPublic) {
        String oldImageKey = extractS3KeyFromUrl(url, isPublic);
        deleteObject(oldImageKey, isPublic);
    }
}
