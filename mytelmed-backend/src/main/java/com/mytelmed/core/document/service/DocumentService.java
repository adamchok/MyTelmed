package com.mytelmed.core.document.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.family.FamilyPermissionType;
import com.mytelmed.common.constant.file.DocumentType;
import com.mytelmed.common.constant.file.FileType;
import com.mytelmed.common.event.document.DocumentDeletedEvent;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.document.dto.CreateDocumentRequestDto;
import com.mytelmed.core.document.dto.UpdateDocumentRequestDto;
import com.mytelmed.core.document.entity.Document;
import com.mytelmed.core.document.entity.DocumentAccess;
import com.mytelmed.core.document.repository.DocumentRepository;
import com.mytelmed.core.family.service.FamilyMemberPermissionService;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.service.PatientService;
import com.mytelmed.infrastructure.aws.dto.S3StorageOptions;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.model.S3Exception;
import java.io.IOException;
import java.util.List;
import java.util.UUID;


@Slf4j
@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final AwsS3Service awsS3Service;
    private final PatientService patientService;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final FamilyMemberPermissionService familyMemberPermissionService;

    public DocumentService(DocumentRepository documentRepository, AwsS3Service awsS3Service,
                           PatientService patientService, ApplicationEventPublisher applicationEventPublisher, FamilyMemberPermissionService familyMemberPermissionService) {
        this.documentRepository = documentRepository;
        this.awsS3Service = awsS3Service;
        this.patientService = patientService;
        this.applicationEventPublisher = applicationEventPublisher;
        this.familyMemberPermissionService = familyMemberPermissionService;
    }

    public Document findById(UUID documentId) throws ResourceNotFoundException {
        log.debug("Retrieving document with ID: {}", documentId);

        return documentRepository.findById(documentId)
                .orElseThrow(() -> {
                    log.warn("Document not found with ID: {}", documentId);
                    return new ResourceNotFoundException("Document not found");
                });
    }

    public List<Document> findAllByPatientId(UUID patientId, Account requestingAccount) throws AppException {
        log.debug("Fetching all documents for patient with ID: {}", patientId);

        // Verify account is authorized to view documents for this patient
        if (!familyMemberPermissionService.isAuthorizedForPatient(requestingAccount, patientId,
                FamilyPermissionType.VIEW_MEDICAL_RECORDS)) {
            throw new AppException("Insufficient permissions to view documents for this patient");
        }

        try {
            return documentRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        } catch (Exception e) {
            log.error("Unexpected error while fetching documents for patient with ID: {}", patientId, e);
            throw new AppException("Failed to fetch documents");
        }
    }

    public List<Document> findAllByPatientAccount(Account account) throws AppException {
        log.debug("Fetching all documents for patient account with ID: {}", account.getId());

        try {
            return documentRepository.findByPatientAccountOrderByCreatedAtDesc(account);
        } catch (Exception e) {
            log.error("Unexpected error while fetching documents for patient account with ID: {}", account.getId(), e);
            throw new AppException("Failed to fetch documents");
        }
    }

    @Transactional
    public UUID create(Account account, CreateDocumentRequestDto request)
            throws AppException {
        log.debug("Creating new document for patient with account ID: {}", account.getId());

        // Find patient by account ID
        Patient patient = patientService.findPatientByAccountId(account.getId());

        try {
            DocumentAccess newAccess = DocumentAccess.builder()
                    .canView(false)
                    .canAttach(false)
                    .expiryDate(null)
                    .build();

            Document document = Document.builder()
                    .documentName(request.documentName())
                    .documentType(DocumentType.valueOf(request.documentType()))
                    .patient(patient)
                    .documentAccess(newAccess)
                    .build();

            // Set up bidirectional relationship
            newAccess.setDocument(document);

            log.debug("Creating document entry for patient: {}", patient.getId());
            document = documentRepository.save(document);
            log.info("Created document entry for patient: {}", patient.getId());

            return document.getId();
        } catch (Exception e) {
            log.error("Unexpected error while creating document entry for patient: {}", patient.getId(), e);
            throw new AppException("Failed to create document");
        }
    }

    @Transactional
    public void uploadDocument(Account account, UUID documentId, MultipartFile documentFile)
            throws AppException {
        // Verify if the file is exist
        if (documentFile == null || documentFile.isEmpty()) {
            log.warn("Attempted to save empty or null document file for patient account ID {}", account.getId());
            throw new InvalidInputException("Missing document file");
        }

        String documentKey = null;

        // Find patient by account ID
        Patient patient = patientService.findPatientByAccountId(account.getId());

        // Find document by document ID
        Document document = findById(documentId);

        // Verify if the document belongs to the patient
        if (document.getPatient().getId() != patient.getId()) {
            log.warn("Account {} attempted to upload document {} they don't own", account.getId(), documentId);
            throw new AppException("Unauthorized to upload document");
        }

        try {
            if (document.getDocumentKey() != null) {
                log.debug("Updating document for entity: {} of type: {}", patient.getId(), document.getDocumentType().name().toLowerCase());
                String imageKey = awsS3Service.updateFile(document.getDocumentKey(), documentFile);
                document.setDocumentKey(imageKey);
                document.setDocumentSize(documentFile.getSize());

                log.debug("Updating document entry to database for entity: {}", patient.getId());
                documentRepository.save(document);

                log.info("Updated document entry to database for entity: {}", patient.getId());
                return;
            }

            // Build the S3 storage options
            S3StorageOptions storageOptions = S3StorageOptions.builder()
                    .fileType(FileType.DOCUMENT)
                    .folderName(document.getDocumentType().name().toLowerCase())
                    .entityId(patient.getId().toString())
                    .build();

            // Upload document to S3 and get Key
            log.debug("Uploading document for patient: {} of type: {}", patient.getId(), document.getDocumentType().name().toLowerCase());
            documentKey = awsS3Service.uploadFileAndGetKey(storageOptions, documentFile);

            // Update document with new key
            document.setDocumentKey(documentKey);
            document.setDocumentSize(documentFile.getSize());

            log.debug("Saving document entry to database for patient: {}", patient.getId());
            documentRepository.save(document);

            log.info("Saved document entry to database for patient: {}", patient.getId());
        } catch (IOException e) {
            log.error("Failed to read document file data for patient: {}", patient.getId(), e);
            throw new AppException("Failed to read document file data");
        } catch (S3Exception e) {
            log.error("AWS S3 error while uploading document for patient: {}", patient.getId(), e);
            throw new AppException("Failed to upload document");
        } catch (Exception e) {
            log.error("Unexpected error while uploading document for patient: {}", patient.getId(), e);

            if (documentKey != null) {
                try {
                    log.info("Rolling back S3 document upload for patient: {} due to database failure", patient.getId());
                    awsS3Service.deleteFile(documentKey);
                } catch (Exception rollbackEx) {
                    log.error("Failed to roll back S3 document upload for patient: {} (key: {})",
                            patient.getId(), documentKey, rollbackEx);
                }
            }

            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            throw new AppException("Failed to upload document");
        }
    }

    @Transactional
    public void update(UpdateDocumentRequestDto request, UUID documentId) throws AppException {
        log.debug("Updating document with ID {}", documentId);

        // Find the document by ID
        Document document = findById(documentId);

        try {
            // Update the document
            document.setDocumentName(request.documentName());

            // Save the document
            log.debug("Updating document metadata to database for document: {}", documentId);
            documentRepository.save(document);

            log.info("Updated document to database for document: {}", documentId);
        } catch (Exception e) {
            log.error("Unexpected error while updating document: {}", documentId, e);
            throw new AppException("Failed to update document");
        }
    }

    @Transactional
    public void delete(UUID documentId) throws AppException {
        log.debug("Deleting document: {}", documentId);

        try {
            Document document = findById(documentId);

            DocumentDeletedEvent event = new DocumentDeletedEvent(documentId, document.getDocumentKey());
            applicationEventPublisher.publishEvent(event);

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
