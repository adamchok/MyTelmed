package com.mytelmed.core.document.service;

import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constants.DocumentType;
import com.mytelmed.core.document.dto.RequestDocumentDto;
import com.mytelmed.core.document.entity.Document;
import com.mytelmed.core.document.repository.DocumentRepository;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.service.PatientService;
import com.mytelmed.infrastructure.aws.dto.S3StorageOptions;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.model.S3Exception;
import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Slf4j
@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final AwsS3Service awsS3Service;
    private final PatientService patientService;

    public DocumentService(DocumentRepository documentRepository, AwsS3Service awsS3Service, PatientService patientService) {
        this.documentRepository = documentRepository;
        this.awsS3Service = awsS3Service;
        this.patientService = patientService;
    }

    public Document getDocumentById(UUID documentId) {
        log.debug("Retrieving document with ID: {}", documentId);
        return documentRepository.findById(documentId)
                .orElseThrow(() -> {
                    log.warn("Document not found with ID: {}", documentId);
                    return new ResourceNotFoundException("Document not found");
                });
    }

    public List<Document> getDocumentsByPatientId(UUID patientId) {
        log.debug("Fetching all documents for patient with ID: {}", patientId);
        return documentRepository.findByPatientId(patientId);
    }

    public String getPresignedDocumentUrl(UUID documentId, Integer expirationMinutes) {
        log.debug("Generating pre-signed URL for document with ID: {}", documentId);
        Document document = getDocumentById(documentId);

        try {
            int expiration = expirationMinutes != null && expirationMinutes > 0 ?
                    expirationMinutes : 15;

            String presignedUrl = awsS3Service.getFileUrl(
                    document.getDocumentKey(),
                    false,
                    Duration.ofMinutes(expiration)
            );

            log.info("Generated pre-signed URL for document: {} (expires in {} minutes)", documentId, expiration);
            return presignedUrl;
        } catch (S3Exception e) {
            log.error("AWS S3 error while generating document URL for document: {}", documentId, e);
        } catch (Exception e) {
            log.error("Failed to generate pre-signed URL for document: {}", documentId, e);
        }
        return null;
    }

    public List<Document> findDocumentsByPatientAndType(UUID patientId, DocumentType documentType) {
        log.debug("Finding {} documents for patient with ID: {}", documentType, patientId);
        return documentRepository.findByPatientIdAndDocumentType(patientId, documentType);
    }

    @Transactional
    public Optional<Document> saveDocument(RequestDocumentDto request, UUID patientId, MultipartFile documentFile) {
        if (documentFile == null || documentFile.isEmpty()) {
            log.warn("Attempted to save empty or null document file for patient: {}", patientId);
            return Optional.empty();
        }

        String documentKey = null;

        try {
            Patient patient = patientService.getPatientById(patientId);

            S3StorageOptions storageOptions = S3StorageOptions.builder()
                    .folderName(request.documentType())
                    .entityId(patientId.toString())
                    .publicAccess(false)
                    .build();

            log.debug("Uploading document for patient: {} of type: {}", patientId, request.documentType());
            documentKey = awsS3Service.uploadFileAndGetKey(storageOptions, documentFile);

            Document document = Document.builder()
                    .documentName(request.documentName())
                    .documentType(DocumentType.valueOf(request.documentType()))
                    .documentKey(documentKey)
                    .documentSize(String.valueOf(documentFile.getSize()))
                    .patient(patient)
                    .build();

            log.debug("Saving document metadata to database for patient: {}", patientId);
            return Optional.of(documentRepository.save(document));
        }  catch (IOException e) {
            log.error("Failed to read document file data for patient: {}", patientId, e);
        } catch (S3Exception e) {
            log.error("AWS S3 error while saving document for patient: {}", patientId, e);
        } catch (Exception e) {
            log.error("Unexpected error while saving document for patient: {}", patientId, e);

            if (documentKey != null) {
                try {
                    log.info("Rolling back S3 document upload for patient: {} due to database failure", patientId);
                    awsS3Service.deleteFile(documentKey, false);
                } catch (Exception rollbackEx) {
                    log.error("Failed to roll back S3 document upload for patient: {} (key: {})",
                            patientId, documentKey, rollbackEx);
                }
            }

            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
        }
        return Optional.empty();
    }

    // DOCUMENT TYPE CANNOT CHANGE - MAINTAIN THE SAME FOLDER STRUCTURE....
    @Transactional
    public Optional<Document> updateDocument(RequestDocumentDto request, UUID documentId, MultipartFile documentFile) {
        if (documentFile == null || documentFile.isEmpty()) {
            log.warn("Attempted to update empty or null document file for document: {}", documentId);
            return Optional.empty();
        }

        try {
            Document existingDocument = getDocumentById(documentId);

            log.debug("Updating document: {} of type: {}", documentId, request.documentType());
            String documentKey = awsS3Service.updateFile(existingDocument.getDocumentKey(), false, documentFile);
            existingDocument.setDocumentKey(documentKey);

            log.debug("Updating document metadata to database for document: {}", documentId);
            return Optional.of(documentRepository.save(existingDocument));
        } catch (IOException e) {
            log.error("Failed to read document file data for: {}", documentId, e);
        } catch (S3Exception e) {
            log.error("AWS S3 error while updating document: {}", documentId, e);
        } catch (Exception e) {
            log.error("Unexpected error while updating document: {}", documentId, e);
        }
        return Optional.empty();
    }

    @Transactional
    public boolean deleteDocument(UUID documentId) {
        try {
            Document document = getDocumentById(documentId);

            awsS3Service.deleteFile(document.getDocumentKey(), true);
            documentRepository.delete(document);
            return true;
        } catch (S3Exception e) {
            log.error("AWS S3 error while deleting document: {}", documentId, e);
        } catch (Exception e) {
            log.error("Unexpected error while deleting document: {}", documentId, e);
        }
        return false;
    }
}
