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
public class AwsPublicS3Service {
    private final String BUCKET_NAME;
    private final S3Client S3_CLIENT;

    public AwsPublicS3Service(
            @Value("${aws.s3.public.bucket-name}") String bucketName,
            S3Client s3Client) {
        this.BUCKET_NAME = bucketName;
        this.S3_CLIENT = s3Client;
    }

    private byte[] getObjectBytes(String keyName) {
        try {
            GetObjectRequest request = GetObjectRequest
                    .builder()
                    .key(keyName)
                    .bucket(BUCKET_NAME)
                    .build();
            ResponseBytes<GetObjectResponse> objectBytes = S3_CLIENT.getObjectAsBytes(request);
            return objectBytes.asByteArray();
        } catch (S3Exception ex) {
            log.error("Error downloading object:", ex);
            throw ex;
        }
    }

    private void putObject(byte[] data, String objectKey) {
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(BUCKET_NAME)
                    .key(objectKey)
                    .build();
            S3_CLIENT.putObject(request, RequestBody.fromBytes(data));
        } catch (S3Exception ex) {
            log.error("Error uploading object:", ex);
            throw ex;
        }
    }

    private void deleteObject(String objectKey) {
        try {
            DeleteObjectRequest request = DeleteObjectRequest.builder()
                    .bucket(BUCKET_NAME)
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

    private String extractS3KeyFromUrl(String imageUrl) {
        String s3BaseUrl = "https://" + BUCKET_NAME + ".s3.amazonaws.com/";
        return imageUrl.replace(s3BaseUrl, "");
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

    /**
     * Updates an existing image in the S3 bucket by deleting the old image and uploading the new one.
     *
     * @param folderName the folder in which the image is stored
     * @param entityId the ID associated with the image
     * @param oldImageUrl the url of the old image in S3 to be replaced
     * @param newFile the new image file to upload
     * @return the public URL of the updated image
     * @throws IOException if an error occurs during the upload or deletion process
     */
    public String updateImageInS3(String folderName, String entityId, String oldImageUrl, MultipartFile newFile) throws IOException {
        String oldImageKey = extractS3KeyFromUrl(oldImageUrl);
        deleteObject(oldImageKey);

        String newFileName = generateRandomFileName(newFile.getOriginalFilename());
        String newKey = folderName + "/" + entityId + "/images/" + newFileName;

        putObject(newFile.getBytes(), newKey);

        return "https://" + BUCKET_NAME + ".s3.amazonaws.com/" + newKey;
    }


    /**
     * Deletes an image from the S3 bucket using its public URL.
     *
     * @param imageUrl the public URL of the image to be deleted from the S3 bucket
     *
     * @throws S3Exception if an error occurs while deleting the image from S3
     */
    public void deleteImageInS3ByImageUrl(String imageUrl) {
        String oldImageKey = extractS3KeyFromUrl(imageUrl);
        deleteObject(oldImageKey);
    }
}
