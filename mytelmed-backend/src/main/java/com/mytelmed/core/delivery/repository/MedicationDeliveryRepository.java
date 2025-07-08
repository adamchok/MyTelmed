package com.mytelmed.core.delivery.repository;

import com.mytelmed.common.constant.delivery.DeliveryStatus;
import com.mytelmed.common.constant.delivery.DeliveryMethod;
import com.mytelmed.core.delivery.entity.MedicationDelivery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for MedicationDelivery entity handling delivery logistics data
 * access.
 */
@Repository
public interface MedicationDeliveryRepository extends JpaRepository<MedicationDelivery, UUID> {

  /**
   * Find delivery by prescription ID
   */
  Optional<MedicationDelivery> findByPrescriptionId(UUID prescriptionId);

  /**
   * Find deliveries by patient ID
   */
  @Query("SELECT md FROM MedicationDelivery md WHERE md.prescription.patient.id = :patientId")
  Page<MedicationDelivery> findByPatientId(@Param("patientId") UUID patientId, Pageable pageable);

  /**
   * Find deliveries by facility ID
   */
  @Query("SELECT md FROM MedicationDelivery md WHERE md.prescription.facility.id = :facilityId")
  Page<MedicationDelivery> findByFacilityId(@Param("facilityId") UUID facilityId, Pageable pageable);

  /**
   * Find deliveries by pharmacist ID
   */
  @Query("SELECT md FROM MedicationDelivery md WHERE md.prescription.pharmacist.id = :pharmacistId")
  Page<MedicationDelivery> findByPharmacistId(@Param("pharmacistId") UUID pharmacistId, Pageable pageable);

  /**
   * Find deliveries by status
   */
  Page<MedicationDelivery> findByStatus(DeliveryStatus status, Pageable pageable);

  /**
   * Find deliveries by delivery method
   */
  Page<MedicationDelivery> findByDeliveryMethod(DeliveryMethod deliveryMethod, Pageable pageable);

  /**
   * Find deliveries by status and delivery method
   */
  Page<MedicationDelivery> findByStatusAndDeliveryMethod(DeliveryStatus status, DeliveryMethod deliveryMethod,
      Pageable pageable);

  /**
   * Find deliveries that are overdue (past estimated delivery date)
   */
  @Query("SELECT md FROM MedicationDelivery md WHERE md.status = :status AND md.estimatedDeliveryDate < :currentTime")
  List<MedicationDelivery> findOverdueDeliveries(@Param("status") DeliveryStatus status,
      @Param("currentTime") Instant currentTime);

  /**
   * Find deliveries for facility and status
   */
  @Query("SELECT md FROM MedicationDelivery md WHERE md.prescription.facility.id = :facilityId AND md.status = :status")
  Page<MedicationDelivery> findByFacilityIdAndStatus(@Param("facilityId") UUID facilityId,
      @Param("status") DeliveryStatus status, Pageable pageable);

  /**
   * Check if delivery exists for prescription
   */
  boolean existsByPrescriptionId(UUID prescriptionId);

  /**
   * Find deliveries by tracking reference
   */
  Optional<MedicationDelivery> findByTrackingReference(String trackingReference);

  /**
   * Count deliveries by status for a facility
   */
  @Query("SELECT COUNT(md) FROM MedicationDelivery md WHERE md.prescription.facility.id = :facilityId AND md.status = :status")
  long countByFacilityIdAndStatus(@Param("facilityId") UUID facilityId, @Param("status") DeliveryStatus status);
}