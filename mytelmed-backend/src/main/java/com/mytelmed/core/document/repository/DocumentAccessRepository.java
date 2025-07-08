package com.mytelmed.core.document.repository;

import com.mytelmed.core.document.entity.DocumentAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface DocumentAccessRepository extends JpaRepository<DocumentAccess, UUID> {
    List<DocumentAccess> findByDocumentId(UUID documentId);
    List<DocumentAccess> findByPermittedAccountId(UUID accountId);
    Optional<DocumentAccess> findByDocumentIdAndPermittedAccountId(UUID documentId, UUID accountId);
    List<DocumentAccess> findByExpiryDateBefore(LocalDate date);
    List<DocumentAccess> findByPermittedAccountIdAndCanViewTrue(UUID accountId);
    List<DocumentAccess> findByPermittedAccountIdAndCanDownloadTrue(UUID accountId);
    List<DocumentAccess> findByPermittedAccountIdAndCanAttachTrue(UUID accountId);
    void deleteByDocumentId(UUID documentId);
}
