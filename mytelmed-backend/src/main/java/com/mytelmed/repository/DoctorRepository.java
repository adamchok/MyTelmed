package com.mytelmed.repository;

import com.mytelmed.model.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    Optional<Doctor> findByEmailHash(String hashedEmail);
    Optional<Doctor> findByNricHash(String hashedNric);
}
