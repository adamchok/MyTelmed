package com.mytelmed.core.pharmacist.repository;

import com.mytelmed.core.pharmacist.entity.Pharmacist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface PharmacistRepository extends JpaRepository<Pharmacist, UUID> {
    Page<Pharmacist> findAllByFacilityId(UUID facilityId, Pageable pageable);

    Optional<Pharmacist> findByAccountId(UUID accountId);
}
