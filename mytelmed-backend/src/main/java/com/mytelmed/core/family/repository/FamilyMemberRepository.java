package com.mytelmed.core.family.repository;

import com.mytelmed.core.family.entity.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;


@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, UUID> {
}
