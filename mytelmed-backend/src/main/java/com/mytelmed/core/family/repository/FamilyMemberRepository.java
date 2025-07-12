package com.mytelmed.core.family.repository;

import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.family.entity.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;


@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, UUID> {
    List<FamilyMember> findAllByPatientId(UUID patientId);

    List<FamilyMember> findAllByMemberAccount(Account memberAccount);

    @Query("SELECT fm FROM FamilyMember fm WHERE fm.memberAccount.id = :accountId")
    List<FamilyMember> findByMemberAccountId(@Param("accountId") UUID accountId);

    @Query("SELECT fm FROM FamilyMember fm WHERE fm.memberAccount.id = :accountId AND fm.patient.id = :patientId")
    List<FamilyMember> findByMemberAccountIdAndPatientId(@Param("accountId") UUID accountId, @Param("patientId") UUID patientId);

    List<FamilyMember> findAllByHashedNricAndPendingTrue(String hashedNric);
}
