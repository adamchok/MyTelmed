package com.mytelmed.core.document.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.file.DocumentType;
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
import java.util.UUID;

@Slf4j
@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final AwsS3Service awsS3Service;
    private final PatientService patientService;

    public DocumentService(DocumentRepository documentRepository, AwsS3Service awsS3Service,
            PatientService patientService) {
        this.documentRepository = documentRepository;
        this.awsS3Service = awsS3Service;
        this.patientService = patientService;
    }

    public Document getDocumentById(UUID documentId) throws ResourceNotFoundException {
        log.debug("Retrieving document with ID: {}", documentId);

        return documentRepository.findById(documentId)
                .orElseThrow(() -> {
                    log.warn("Document not found with ID: {}", documentId);
                    return new ResourceNotFoundException("Document not found");
                });
    }

    public List<Document> getDocumentsByPatientId(UUID patientId) throws AppException {
        log.debug("Fetching all documents for patient with ID: {}", patientId);

        try {
            return documentRepository.findByPatientId(patientId);
        } catch (Exception e) {
            log.error("Unexpected error while fetching documents for patient with ID: {}", patientId, e);
            throw new AppException("Failed to fetch documents");
        }
    }

    public String getPresignedDocumentUrl(UUID documentId) throws AppException {
        log.debug("Generating pre-signed URL for document with ID: {}", documentId);

        try {
            Document document = getDocumentById(documentId);
            String presignedUrl = awsS3Service.generatePresignedDocumentUrl(document.getDocumentKey());

            log.info("Generated pre-signed URL for document: {} (expires in 10 minutes)", documentId);
            return presignedUrl;
        } catch (Exception e) {
            log.error("Failed to generate pre-signed URL for document: {}", documentId, e);
            throw new AppException("Failed to generate the document's pre-signed URL");
        }
    }

    public List<Document> findDocumentsByPatientAndType(UUID patientId, DocumentType documentType) throws AppException {
        log.debug("Finding {} documents for patient with ID: {}", documentType, patientId);

        try {
            return documentRepository.findByPatientIdAndDocumentType(patientId, documentType);
        } catch (Exception e) {
            log.error("Unexpected error while finding {} documents for patient with ID: {}", documentType.toString(),
                    patientId, e);
            throw new AppException("Failed to fetch documents");
        }
    }

    @Transactional
    public void saveDocument(RequestDocumentDto request, UUID patientId, MultipartFile documentFile)
            throws AppException {
        if (documentFile == null || documentFile.isEmpty()) {
            log.warn("Attempted to save empty or null document file for patient: {}", patientId);
            throw new InvalidInputException("Missing document file");
        }

        String documentKey = null;

        try {
            Patient patient = patientService.findPatientById(patientId);

            S3StorageOptions storageOptions = S3StorageOptions.builder()
                    .fileType(com.mytelmed.common.constant.file.FileType.DOCUMENT)
                    .folderName(request.documentType())
                    .entityId(patientId.toString())
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
            documentRepository.save(document);

            log.info("Saved document metadata to database for patient: {}", patientId);
        } catch (IOException e) {
            log.error("Failed to read document file data for patient: {}", patientId, e);
            throw new AppException("Failed to read document file data");
        } catch (S3Exception e) {
            log.error("AWS S3 error while saving document for patient: {}", patientId, e);
            throw new AppException("Failed to upload document");
        } catch (Exception e) {
            log.error("Unexpected error while saving document for patient: {}", patientId, e);

            if (documentKey != null) {
                try {
                    log.info("Rolling back S3 document upload for patient: {} due to database failure", patientId);
                    awsS3Service.deleteFile(documentKey);
                } catch (Exception rollbackEx) {
                    log.error("Failed to roll back S3 document upload for patient: {} (key: {})",
                            patientId, documentKey, rollbackEx);
                }
            }

            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            throw new AppException("Failed to save document");
        }
    }

    @Transactional
    public void updateDocument(RequestDocumentDto request, UUID documentId, MultipartFile documentFile)
            throws AppException {
        log.debug("Updating document: {} of type: {}", documentId, request.documentType());

        try {
            Document existingDocument = getDocumentById(documentId);

            if (documentFile != null) {
                String documentKey = awsS3Service.updateFile(existingDocument.getDocumentKey(), documentFile);
                existingDocument.setDocumentKey(documentKey);
            }

            existingDocument.setDocumentName(request.documentName());

            log.debug("Updating document metadata to database for document: {}", documentId);
            documentRepository.save(existingDocument);

            log.info("Updated document to database for document: {}", documentId);
        } catch (IOException e) {
            log.error("Failed to read document file data for: {}", documentId, e);
            throw new AppException("Failed to read document file data");
        } catch (S3Exception e) {
            log.error("AWS S3 error while updating document: {}", documentId, e);
            throw new AppException("Failed to update document");
        } catch (Exception e) {
            log.error("Unexpected error while updating document: {}", documentId, e);
            throw new AppException("Failed to update document");
        }
    }

    @Transactional
    public void deleteDocument(UUID documentId) throws AppException {
        log.debug("Deleting document: {}", documentId);

        try {
            Document document = getDocumentById(documentId);
            awsS3Service.deleteFile(document.getDocumentKey());

            documentRepository.delete(document);
            log.info("Deleted document: {}", documentId);
        } catch (S3Exception e) {
            log.error("AWS S3 error while deleting document: {}", documentId, e);
            throw new AppException("Failed to delete document");
        } catch (Exception e) {
            log.error("Unexpected error while deleting document: {}", documentId, e);
            throw new AppException("Failed to delete document");
        }
    }
}
