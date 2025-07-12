package com.mytelmed.core.document.repository;

import com.mytelmed.core.document.entity.DocumentAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;


public interface DocumentAccessRepository extends JpaRepository<DocumentAccess, UUID> {
    Optional<DocumentAccess> findByDocumentIdAndDocumentPatientAccountId(UUID documentId, UUID documentPatientAccountId);
}
