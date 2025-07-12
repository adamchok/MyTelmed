package com.mytelmed.core.document.repository;

import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.document.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;


@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByPatientIdOrderByCreatedAtDesc(UUID patientId);

    List<Document> findByPatientAccountOrderByCreatedAtDesc(Account account);
}
