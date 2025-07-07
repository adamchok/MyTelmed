package com.mytelmed.core.prescription.repository;

import com.mytelmed.core.prescription.entity.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;


@Repository
public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, UUID> {
}
