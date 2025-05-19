package com.mytelmed.repository;

import com.mytelmed.constant.EntityType;
import com.mytelmed.model.entity.Patient;
import com.mytelmed.model.entity.files.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByPatient(Patient patient);
    Page<Document> findByPatient(Patient patient, Pageable pageable);
}