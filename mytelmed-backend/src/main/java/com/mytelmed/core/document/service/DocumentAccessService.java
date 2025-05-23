package com.mytelmed.core.document.service;

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
import java.util.Optional;
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

    public DocumentAccess getDocumentAccessById(UUID accessId) {
        log.debug("Retrieving document access with ID: {}", accessId);
        return documentAccessRepository.findById(accessId)
                .orElseThrow(() -> {
                    log.warn("Document access not found with ID: {}", accessId);
                    return new ResourceNotFoundException("Document access not found");
                });
    }

    public List<DocumentAccess> getAccessForDocument(UUID documentId) {
        log.debug("Retrieving all access entries for document with ID: {}", documentId);
        documentService.getDocumentById(documentId);
        return documentAccessRepository.findByDocumentId(documentId);
    }

    public List<DocumentAccess> getDocumentsAccessibleByAccount(UUID accountId) {
        log.debug("Retrieving all documents accessible by account with ID: {}", accountId);
        return documentAccessRepository.findByPermittedAccountId(accountId);
    }

    public List<Document> getViewableDocuments(UUID accountId) {
        log.debug("Getting viewable documents for account {}", accountId);
        return documentAccessRepository.findByPermittedAccountIdAndCanViewTrue(accountId)
                .stream()
                .filter(access -> access.getExpiryDate() == null || !access.getExpiryDate().isBefore(LocalDate.now()))
                .map(DocumentAccess::getDocument)
                .collect(Collectors.toList());
    }

    public List<Document> getDownloadableDocuments(UUID accountId) {
        log.debug("Getting downloadable documents for account {}", accountId);
        return documentAccessRepository.findByPermittedAccountIdAndCanDownloadTrue(accountId)
                .stream()
                .filter(access -> access.getExpiryDate() == null || !access.getExpiryDate().isBefore(LocalDate.now()))
                .map(DocumentAccess::getDocument)
                .collect(Collectors.toList());
    }

    public List<DocumentAccess> findExpiredAccess() {
        log.debug("Finding all expired document access entries");
        LocalDate today = LocalDate.now();
        return documentAccessRepository.findAll().stream()
                .filter(access -> access.getExpiryDate() != null && access.getExpiryDate().isBefore(today))
                .collect(Collectors.toList());
    }

    public boolean hasAccess(UUID documentId, UUID accountId, boolean checkDownload) {
        log.debug("Checking if account {} has {} access to document {}",
                accountId, (checkDownload ? "download" : "view"), documentId);

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
    }

    @Transactional
    public Optional<DocumentAccess> grantAccess(UUID documentId, UUID accountId,
                                                boolean canView, boolean canDownload, LocalDate expiryDate) {
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
                return Optional.of(documentAccessRepository.save(existingAccess));
            }

            DocumentAccess newAccess = DocumentAccess.builder()
                    .document(document)
                    .permittedAccount(account)
                    .canView(canView)
                    .canDownload(canDownload)
                    .expiryDate(expiryDate)
                    .build();

            DocumentAccess savedAccess = documentAccessRepository.save(newAccess);
            log.info("Access granted to document {} for account {} (ID: {})",
                    documentId, accountId, savedAccess.getId());

            return Optional.of(savedAccess);
        } catch (Exception e) {
            log.error("Unexpected error occured while granting document access for account: {}", accountId, e);
        }
        return Optional.empty();
    }

    @Transactional
    public Optional<DocumentAccess> updateAccess(UUID accessId, boolean canView,
                                       boolean canDownload, LocalDate expiryDate) {
        log.debug("Updating document access with ID: {}", accessId);

        try {
            DocumentAccess access = getDocumentAccessById(accessId);
            access.setCanView(canView);
            access.setCanDownload(canDownload);
            access.setExpiryDate(expiryDate);

            DocumentAccess updatedAccess = documentAccessRepository.save(access);
            log.info("Updated document access with ID: {}", accessId);

            return Optional.of(updatedAccess);
        } catch (Exception e) {
            log.error("Unexpected error occured while updating document access: {}", accessId, e);
        }
        return Optional.empty();
    }

    @Transactional
    public boolean revokeAccess(UUID documentId, UUID accountId) {
        log.debug("Revoking access to document {} for account {}", documentId, accountId);

        return documentAccessRepository.findByDocumentIdAndPermittedAccountId(documentId, accountId)
                .map(access -> {
                    documentAccessRepository.delete(access);
                    log.info("Revoked access to document {} for account {}", documentId, accountId);
                    return true;
                })
                .orElseGet(() -> {
                    log.debug("No access found to revoke for document {} and account {}", documentId, accountId);
                    return false;
                });
    }

    @Transactional
    public boolean revokeAllAccessForDocument(UUID documentId) {
        log.debug("Revoking all access for document {}", documentId);

        try {
            documentAccessRepository.deleteByDocumentId(documentId);
            log.info("Revoked all access for document {}", documentId);

            return true;
        } catch (Exception e) {
            log.error("Unexpected error occured while revoking all access for document: {}", documentId, e);
        }
        return false;
    }

    @Transactional
    public int cleanupExpiredAccess() {
        log.debug("Cleaning up expired document access entries");

        try {
            List<DocumentAccess> expiredAccess = findExpiredAccess();

            if (!expiredAccess.isEmpty()) {
                documentAccessRepository.deleteAll(expiredAccess);
                log.info("Cleaned up {} expired document access entries", expiredAccess.size());
            }

            return expiredAccess.size();
        } catch (Exception e) {
            log.error("Unexpected error occurred while cleaning up expired document access entries: {}", e.getMessage(), e);
        }
        return -1;
    }

    @Transactional
    public Optional<DocumentAccess> extendAccessExpiry(UUID accessId, LocalDate newExpiryDate) {
        log.debug("Extending access expiry for ID: {} to {}", accessId, newExpiryDate);

        try {
            if (newExpiryDate != null && newExpiryDate.isBefore(LocalDate.now())) {
                log.warn("Invalid expiry date: {}", newExpiryDate);
                throw new InvalidInputException("Expiry date cannot be in the past");
            }

            DocumentAccess access = getDocumentAccessById(accessId);
            access.setExpiryDate(newExpiryDate);

            DocumentAccess updatedAccess = documentAccessRepository.save(access);
            log.info("Extended access expiry for ID: {} to {}", accessId, newExpiryDate);

            return Optional.of(updatedAccess);
        } catch (Exception e) {
            log.error("Unexpected error occurred while extending document access expiry: {}", accessId, e);
        }
        return Optional.empty();
    }
}
