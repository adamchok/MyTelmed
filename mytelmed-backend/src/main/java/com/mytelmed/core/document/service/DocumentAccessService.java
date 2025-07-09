package com.mytelmed.core.document.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.AccountService;
import com.mytelmed.core.document.entity.Document;
import com.mytelmed.core.document.entity.DocumentAccess;
import com.mytelmed.core.document.repository.DocumentAccessRepository;
import com.mytelmed.core.family.service.FamilyMemberPermissionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Slf4j
@Service
public class DocumentAccessService {
    private final DocumentAccessRepository documentAccessRepository;
    private final DocumentService documentService;
    private final AccountService accountService;
    private final FamilyMemberPermissionService familyPermissionService;

    public DocumentAccessService(DocumentAccessRepository documentAccessRepository, 
                               DocumentService documentService, 
                               AccountService accountService,
                               FamilyMemberPermissionService familyPermissionService) {
        this.documentAccessRepository = documentAccessRepository;
        this.documentService = documentService;
        this.accountService = accountService;
        this.familyPermissionService = familyPermissionService;
    }

    @Transactional(readOnly = true)
    public DocumentAccess getDocumentAccessById(UUID accessId) throws ResourceNotFoundException {
        log.debug("Retrieving document access with ID: {}", accessId);
        return documentAccessRepository.findById(accessId)
                .orElseThrow(() -> {
                    log.warn("Document access not found with ID: {}", accessId);
                    return new ResourceNotFoundException("Document access not found");
                });
    }

    @Transactional(readOnly = true)
    public List<DocumentAccess> getAccessForDocument(UUID documentId) throws AppException {
        log.debug("Retrieving all access entries for document with ID: {}", documentId);

        documentService.findById(documentId);

        try {
            return documentAccessRepository.findByDocumentId(documentId);
        } catch (Exception e) {
            log.error("Unexpected error occurred while retrieving access entries for document: {}", documentId, e);
            throw new AppException("Failed to retrieve access entries");
        }
    }

    @Transactional(readOnly = true)
    public List<DocumentAccess> getDocumentsAccessibleByAccount(UUID accountId) throws AppException {
        log.debug("Retrieving all documents accessible by account with ID: {}", accountId);

        try {
            return documentAccessRepository.findByPermittedAccountId(accountId);
        } catch (Exception e) {
            log.error("Unexpected error occurred while retrieving access entries for account: {}", accountId, e);
            throw new AppException("Failed to retrieve access entries");
        }
    }

    @Transactional(readOnly = true)
    public List<Document> getViewableDocuments(UUID accountId) {
        log.debug("Getting viewable documents for account {}", accountId);

        try {
            return documentAccessRepository.findByPermittedAccountIdAndCanViewTrue(accountId)
                    .stream()
                    .filter(access -> access.getExpiryDate() == null || !access.getExpiryDate().isBefore(LocalDate.now()))
                    .map(DocumentAccess::getDocument)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Unexpected error occurred while retrieving viewable access entries for account: {}", accountId, e);
            throw new AppException("Failed to retrieve access entries");
        }
    }

    @Transactional(readOnly = true)
    public List<Document> getDownloadableDocuments(UUID accountId) throws AppException {
        log.debug("Getting downloadable documents for account {}", accountId);

        try {
            return documentAccessRepository.findByPermittedAccountIdAndCanDownloadTrue(accountId)
                    .stream()
                    .filter(access -> access.getExpiryDate() == null || !access.getExpiryDate().isBefore(LocalDate.now()))
                    .map(DocumentAccess::getDocument)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Unexpected error occurred while retrieving downloadable access entries for account: {}", accountId, e);
            throw new AppException("Failed to retrieve access entries");
        }
    }

    @Transactional(readOnly = true)
    public List<Document> getAttachableDocuments(UUID accountId) throws AppException {
        log.debug("Getting attachable documents for account {}", accountId);

        try {
            return documentAccessRepository.findByPermittedAccountIdAndCanAttachTrue(accountId)
                    .stream()
                    .filter(access -> access.getExpiryDate() == null || !access.getExpiryDate().isBefore(LocalDate.now()))
                    .map(DocumentAccess::getDocument)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Unexpected error occurred while retrieving attachable access entries for account: {}", accountId, e);
            throw new AppException("Failed to retrieve access entries");
        }
    }

    @Transactional(readOnly = true)
    public List<DocumentAccess> findExpiredAccess() throws AppException {
        log.debug("Finding all expired document access entries");

        try {
            LocalDate today = LocalDate.now();
            return documentAccessRepository.findByExpiryDateBefore(today);
        } catch (Exception e) {
            log.error("Unexpected error occurred while finding expired access entries: {}", e.getMessage(), e);
            throw new AppException("Failed to retrieve expired access entries");
        }
    }

    @Transactional(readOnly = true)
    public boolean hasAccess(UUID documentId, UUID accountId, boolean checkDownload) {
        log.debug("Checking if account {} has {} access to document {}", accountId, (checkDownload ? "download" : "view"), documentId);

        try {
            return documentAccessRepository.findByDocumentIdAndPermittedAccountId(documentId, accountId)
                    .map(access -> {
                        if (access.getExpiryDate() != null && access.getExpiryDate().isBefore(LocalDate.now())) {
                            log.debug("Access expired on {} for account {} to document {}",
                                    access.getExpiryDate(), accountId, documentId);
                            return false;
                        }

                        return checkDownload ? access.isCanDownload() : access.isCanView();
                    })
                    .orElse(false);
        } catch (Exception e) {
            log.error("Unexpected error occurred while checking access: {}", e.getMessage(), e);
            return false;
        }
    }

    @Transactional(readOnly = true)
    public boolean hasAttachAccess(UUID documentId, UUID accountId) {
        log.debug("Checking if account {} has attach access to document {}", accountId, documentId);

        try {
            return documentAccessRepository.findByDocumentIdAndPermittedAccountId(documentId, accountId)
                    .map(access -> {
                        if (access.getExpiryDate() != null && access.getExpiryDate().isBefore(LocalDate.now())) {
                            log.debug("Access expired on {} for account {} to document {}",
                                    access.getExpiryDate(), accountId, documentId);
                            return false;
                        }

                        return access.isCanAttach();
                    })
                    .orElse(false);
        } catch (Exception e) {
            log.error("Unexpected error occurred while checking attach access: {}", e.getMessage(), e);
            return false;
        }
    }

    @Transactional
    public void grantOrUpdateDocumentAccess(UUID documentId, UUID accountId, boolean canView, boolean canDownload, boolean canAttach,
                                                                LocalDate expiryDate) throws AppException {
        log.debug("Granting access to document {} for account {}", documentId, accountId);

        try {
            Document document = documentService.findById(documentId);
            Account account = accountService.getAccountById(accountId);

            DocumentAccess existingAccess = documentAccessRepository
                    .findByDocumentIdAndPermittedAccountId(documentId, accountId)
                    .orElse(null);

            if (existingAccess != null) {
                log.debug("Updating existing access for document {} and account {}", documentId, accountId);

                existingAccess.setCanView(canView);
                existingAccess.setCanDownload(canDownload);
                existingAccess.setCanAttach(canAttach);
                existingAccess.setExpiryDate(expiryDate);
                documentAccessRepository.save(existingAccess);

                log.info("Updated existing access for document with ID: {}", documentId);
                return;
            }

            DocumentAccess newAccess = DocumentAccess.builder()
                    .document(document)
                    .permittedAccount(account)
                    .canView(canView)
                    .canDownload(canDownload)
                    .canAttach(canAttach)
                    .expiryDate(expiryDate)
                    .build();

            DocumentAccess savedAccess = documentAccessRepository.save(newAccess);
            log.info("Access granted to document {} for account {} with document access {}", documentId, accountId, savedAccess.getId());
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error occurred while granting document access for account: {}", accountId, e);
            throw new AppException("Failed to grant access");
        }
    }

    @Transactional
    public void updateAccess(UUID accessId, boolean canView, boolean canDownload, boolean canAttach, LocalDate expiryDate) throws AppException {
        log.debug("Updating document access with ID: {}", accessId);

        try {
            DocumentAccess access = getDocumentAccessById(accessId);

            access.setCanView(canView);
            access.setCanDownload(canDownload);
            access.setCanAttach(canAttach);
            access.setExpiryDate(expiryDate);

            DocumentAccess updatedAccess = documentAccessRepository.save(access);
            log.info("Updated document access with ID: {}", accessId);
        }  catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error occurred while updating document access: {}", accessId, e);
            throw new AppException("Failed to update access");
        }
    }

    @Transactional
    public void updateDocumentPermissionsByPatient(UUID documentId, UUID patientAccountId, boolean canView, boolean canDownload, boolean canAttach, LocalDate expiryDate) throws AppException {
        log.debug("Patient {} updating permissions for document {}", patientAccountId, documentId);

        try {
            // Get the document and verify patient ownership
            Document document = documentService.findById(documentId);
            
            if (!document.getPatient().getAccount().getId().equals(patientAccountId)) {
                log.warn("Patient {} attempted to update permissions for document {} they don't own", patientAccountId, documentId);
                throw new AppException("Unauthorized to modify this document's permissions");
            }

            // Find existing access for the patient
            DocumentAccess existingAccess = documentAccessRepository
                    .findByDocumentIdAndPermittedAccountId(documentId, patientAccountId)
                    .orElse(null);

            if (existingAccess != null) {
                log.debug("Updating existing access for document {} and patient {}", documentId, patientAccountId);

                existingAccess.setCanView(canView);
                existingAccess.setCanDownload(canDownload);
                existingAccess.setCanAttach(canAttach);
                existingAccess.setExpiryDate(expiryDate);
                documentAccessRepository.save(existingAccess);

                log.info("Updated document permissions for patient {} on document {}", patientAccountId, documentId);
            } else {
                // Create new access entry for the patient
                Account patientAccount = accountService.getAccountById(patientAccountId);
                
                DocumentAccess newAccess = DocumentAccess.builder()
                        .document(document)
                        .permittedAccount(patientAccount)
                        .canView(canView)
                        .canDownload(canDownload)
                        .canAttach(canAttach)
                        .expiryDate(expiryDate)
                        .build();

                DocumentAccess savedAccess = documentAccessRepository.save(newAccess);
                log.info("Created new access permissions for patient {} on document {}", patientAccountId, documentId);
            }
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error occurred while updating document permissions for patient: {}", patientAccountId, e);
            throw new AppException("Failed to update document permissions");
        }
    }

    @Transactional
    public void revokeAccess(UUID documentId, UUID accountId) throws AppException {
        log.debug("Revoking access to document {} for account {}", documentId, accountId);

        try {
            DocumentAccess access = documentAccessRepository.findByDocumentIdAndPermittedAccountId(documentId, accountId)
                    .orElseThrow(() -> {
                        log.warn("No access found to revoke for document {} and account {}", documentId, accountId);
                        return new ResourceNotFoundException("No access found to revoke");
                    });

            documentAccessRepository.delete(access);
            log.info("Revoked access to document {} for account {}", documentId, accountId);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error occurred while revoking access to document: {} for account: {}", documentId, accountId, e);
            throw new AppException("Failed to revoke access");
        }
    }

    @Transactional
    public void revokeAllAccessForDocument(UUID documentId) throws AppException {
        log.debug("Revoking all access for document {}", documentId);

        try {
            documentAccessRepository.deleteByDocumentId(documentId);
            log.info("Revoked all access for document {}", documentId);
        } catch (Exception e) {
            log.error("Unexpected error occurred while revoking all access for document: {}", documentId, e);
            throw new AppException("Failed to revoke all access");
        }
    }

    @Transactional
    public int cleanupExpiredAccess() throws AppException {
        log.debug("Cleaning up expired document access entries");

        try {
            List<DocumentAccess> expiredAccess = findExpiredAccess();

            if (!expiredAccess.isEmpty()) {
                documentAccessRepository.deleteAll(expiredAccess);
                log.info("Cleaned up {} expired document access entries", expiredAccess.size());
            }

            return expiredAccess.size();
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error occurred while cleaning up expired document access entries: {}", e.getMessage(), e);
            throw new AppException("Failed to clean up expired access entries");
        }
    }

    @Transactional
    public void extendAccessExpiry(UUID accessId, LocalDate newExpiryDate) throws AppException {
        log.debug("Extending access expiry for ID: {} to {}", accessId, newExpiryDate);

        try {
            if (newExpiryDate != null && newExpiryDate.isBefore(LocalDate.now())) {
                log.warn("Invalid expiry date: {}", newExpiryDate);
                throw new InvalidInputException("Expiry date cannot be in the past");
            }

            DocumentAccess access = getDocumentAccessById(accessId);
            access.setExpiryDate(newExpiryDate);
            documentAccessRepository.save(access);

            log.info("Extended access expiry for ID: {} to {}", accessId, newExpiryDate);
        } catch (ResourceNotFoundException | InvalidInputException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error occurred while extending document access expiry: {}", accessId, e);
            throw new AppException("Failed to extend access expiry");
        }
    }
}
