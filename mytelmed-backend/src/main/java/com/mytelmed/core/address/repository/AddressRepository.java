package com.mytelmed.core.address.repository;

import com.mytelmed.core.address.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;


@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {
    List<Address> findByPatientAccountId(UUID accountId);
}
