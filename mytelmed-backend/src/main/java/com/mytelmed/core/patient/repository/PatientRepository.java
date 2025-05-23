package com.mytelmed.core.patient.repository;

import com.mytelmed.core.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    Optional<Patient> findByHashedEmail(String hashedEmail);
    Optional<Patient> findByHashedNric(String hashedNric);
    Optional<Patient> findByAccountId(UUID accountId);
}
