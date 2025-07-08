package com.mytelmed.core.family.repository;

import com.mytelmed.common.constant.family.FamilyPermissionType;
import com.mytelmed.core.family.entity.FamilyMemberPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface FamilyMemberPermissionRepository extends JpaRepository<FamilyMemberPermission, UUID> {

    @Query("SELECT fmp FROM FamilyMemberPermission fmp WHERE fmp.familyMember.id = :familyMemberId")
    List<FamilyMemberPermission> findByFamilyMemberId(@Param("familyMemberId") UUID familyMemberId);

    @Query("SELECT fmp FROM FamilyMemberPermission fmp WHERE fmp.familyMember.id = :familyMemberId AND fmp.permissionType = :permissionType")
    Optional<FamilyMemberPermission> findByFamilyMemberIdAndPermissionType(@Param("familyMemberId") UUID familyMemberId, @Param("permissionType") FamilyPermissionType permissionType);

    @Query("SELECT fmp FROM FamilyMemberPermission fmp WHERE fmp.familyMember.patient.id = :patientId")
    List<FamilyMemberPermission> findByPatientId(@Param("patientId") UUID patientId);

    @Query("SELECT fmp FROM FamilyMemberPermission fmp WHERE fmp.familyMember.memberAccount.id = :accountId AND fmp.familyMember.patient.id = :patientId AND fmp.permissionType = :permissionType")
    Optional<FamilyMemberPermission> findByAccountIdAndPatientIdAndPermissionType(@Param("accountId") UUID accountId, @Param("patientId") UUID patientId, @Param("permissionType") FamilyPermissionType permissionType);

    @Query("SELECT fmp FROM FamilyMemberPermission fmp WHERE fmp.expiryDate IS NOT NULL AND fmp.expiryDate < :currentDate")
    List<FamilyMemberPermission> findExpiredPermissions(@Param("currentDate") LocalDate currentDate);

    @Query("SELECT fmp FROM FamilyMemberPermission fmp WHERE fmp.familyMember.memberAccount.id = :accountId AND fmp.granted = true AND (fmp.expiryDate IS NULL OR fmp.expiryDate >= :currentDate)")
    List<FamilyMemberPermission> findActivePermissionsByAccountId(@Param("accountId") UUID accountId, @Param("currentDate") LocalDate currentDate);
} 