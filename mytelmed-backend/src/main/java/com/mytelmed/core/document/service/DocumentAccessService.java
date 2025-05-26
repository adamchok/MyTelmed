package com.mytelmed.core.document.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.AccountService;
import com.mytelmed.core.document.entity.Document;
import com.mytelmed.core.document.entity.DocumentAccess;
import com.mytelmed.core.document.repository.DocumentAccessRepository;
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

    public DocumentAccessService(DocumentAccessRepository documentAccessRepository, DocumentService documentService, AccountService accountService) {
        this.documentAccessRepository = documentAccessRepository;
        this.documentService = documentService;
        this.accountService = accountService;
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

        documentService.getDocumentById(documentId);

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

    @Transactional
    public void grantOrUpdateDocumentAccess(UUID documentId, UUID accountId, boolean canView, boolean canDownload,
                                                                LocalDate expiryDate) throws AppException {
        log.debug("Granting access to document {} for account {}", documentId, accountId);

        try {
            Document document = documentService.getDocumentById(documentId);
            Account account = accountService.getAccountById(accountId);

            DocumentAccess existingAccess = documentAccessRepository
                    .findByDocumentIdAndPermittedAccountId(documentId, accountId)
                    .orElse(null);

            if (existingAccess != null) {
                log.debug("Updating existing access for document {} and account {}", documentId, accountId);

                existingAccess.setCanView(canView);
                existingAccess.setCanDownload(canDownload);
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
    public void updateAccess(UUID accessId, boolean canView, boolean canDownload, LocalDate expiryDate) throws AppException {
        log.debug("Updating document access with ID: {}", accessId);

        try {
            DocumentAccess access = getDocumentAccessById(accessId);

            access.setCanView(canView);
            access.setCanDownload(canDownload);
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
