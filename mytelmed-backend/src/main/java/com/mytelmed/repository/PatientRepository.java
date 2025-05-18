package com.mytelmed.repository;

import com.mytelmed.model.entity.Patient;
import com.mytelmed.model.entity.security.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    Optional<Patient> findByNricHash(String nric);
    Optional<Patient> findByEmailHash(String email);
    Optional<Patient> findByUser(User user);
}
