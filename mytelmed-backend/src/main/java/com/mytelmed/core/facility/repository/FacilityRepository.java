package com.mytelmed.core.facility.repository;

import com.mytelmed.core.facility.entity.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;


@Repository
public interface FacilityRepository extends JpaRepository<Facility, UUID> {
    boolean existsFacilitiesByAddress(String address);

    boolean existsFacilityByName(String name);

    boolean existsFacilityByTelephone(String telephone);
}
