package com.mytelmed.core.appointment.repository;

import com.mytelmed.core.appointment.entity.AppointmentDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentDocumentRepository extends JpaRepository<AppointmentDocument, UUID> {

  @Query("SELECT ad FROM AppointmentDocument ad WHERE ad.appointment.id = :appointmentId")
  List<AppointmentDocument> findByAppointmentId(@Param("appointmentId") UUID appointmentId);

  @Query("SELECT COUNT(ad) > 0 FROM AppointmentDocument ad WHERE ad.appointment.id = :appointmentId AND ad.document.id = :documentId")
  boolean existsByAppointmentIdAndDocumentId(@Param("appointmentId") UUID appointmentId,
      @Param("documentId") UUID documentId);

  @Query("DELETE FROM AppointmentDocument ad WHERE ad.appointment.id = :appointmentId")
  void deleteByAppointmentId(@Param("appointmentId") UUID appointmentId);

  @Query("SELECT ad FROM AppointmentDocument ad WHERE ad.appointment.id = :appointmentId AND ad.document.id = :documentId")
  AppointmentDocument findByAppointmentIdAndDocumentId(@Param("appointmentId") UUID appointmentId,
      @Param("documentId") UUID documentId);
}