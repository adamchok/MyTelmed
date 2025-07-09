package com.mytelmed.core.doctor.repository;

import com.mytelmed.core.doctor.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    Page<Doctor> findDistinctBySpecialityListContainingIgnoreCase(String name, Pageable pageable);

    Page<Doctor> findAllByFacilityId(UUID facilityId, Pageable pageable);

    Optional<Doctor> findByAccountId(UUID accountId);

    Optional<Doctor> findByAccount(com.mytelmed.core.auth.entity.Account account);
}
