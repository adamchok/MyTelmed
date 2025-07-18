package com.mytelmed.core.doctor.repository;

import com.mytelmed.core.doctor.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    Optional<Doctor> findByAccountId(UUID accountId);

    Optional<Doctor> findByAccount(com.mytelmed.core.auth.entity.Account account);
    
    Optional<Doctor> findByHashedNric(String hashedNric);
    
    Optional<Doctor> findByHashedEmail(String hashedEmail);

    boolean existsDoctorByHashedNric(String hashedNric);

    boolean existsDoctorByHashedEmail(String hashedEmail);

    boolean existsDoctorByHashedPhone(String hashedPhone);
}
