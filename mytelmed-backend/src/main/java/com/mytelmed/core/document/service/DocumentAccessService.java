package com.mytelmed.core.document.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.document.entity.DocumentAccess;
import com.mytelmed.core.document.repository.DocumentAccessRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.UUID;


@Slf4j
@Service
public class DocumentAccessService {
    private final DocumentAccessRepository documentAccessRepository;

    public DocumentAccessService(DocumentAccessRepository documentAccessRepository) {
        this.documentAccessRepository = documentAccessRepository;
    }

    @Transactional(readOnly = true)
    protected DocumentAccess findByDocumentIdAndPatientAccountId(UUID documentId, UUID accountId) throws ResourceNotFoundException {
        log.debug("Retrieving all access entries for document with ID: {}", documentId);

        DocumentAccess access = documentAccessRepository
                .findByDocumentIdAndDocumentPatientAccountId(documentId, accountId)
                .orElseThrow(() -> {
                    log.warn("No access entries found for document with ID: {} and account ID: {}", documentId, accountId);
                    return new ResourceNotFoundException("No document access entry found for document");
                });

        log.debug("Access entry found for document with ID: {}", documentId);
        return access;
    }

    @Transactional
    public void updateAccess(Account account, UUID documentId, boolean canView, boolean canAttach, LocalDate expiryDate) throws AppException {
        log.debug("Updating document access with document ID: {}", documentId);

        // Find access by Document ID
        DocumentAccess access = findByDocumentIdAndPatientAccountId(documentId, account.getId());

        // Verify if the patient can update the document
        if (!access.getDocument().getPatient().getAccount().getId().equals(account.getId())) {
            log.warn("Account {} attempted to update access for document {} they don't own", account.getId(), documentId);
            throw new AppException("Unauthorized to modify this document's access");
        }

        try {
            // Update document access
            access.setCanView(canView);
            access.setCanAttach(canAttach);
            access.setExpiryDate(expiryDate);

            // Save document access
            documentAccessRepository.save(access);

            log.info("Updated document access with ID: {}", documentId);
        } catch (Exception e) {
            log.error("Unexpected error occurred while updating document access: {}", documentId, e);
            throw new AppException("Failed to update access");
        }
    }

    @Transactional
    public void revokeAllAccessByDocumentId(Account account, UUID documentId) throws AppException {
        log.debug("Revoking all access for document {}", documentId);

        // Find document access by document ID
        DocumentAccess access = findByDocumentIdAndPatientAccountId(documentId, account.getId());

        try {
            // Revoking access to document
            access.setCanView(false);
            access.setCanAttach(false);

            // Update new document access
            documentAccessRepository.save(access);

            log.info("Revoked all access for document {}", documentId);
        } catch (Exception e) {
            log.error("Unexpected error occurred while revoking all access for document: {}", documentId, e);
            throw new AppException("Failed to revoke all access");
        }
    }
}
