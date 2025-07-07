package com.mytelmed.core.chat.repository;

import com.mytelmed.core.chat.entity.Chat;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;


@Repository
public interface ChatRepository extends JpaRepository<Chat, UUID> {
    boolean existsByPatientAndDoctor(Patient patient, Doctor doctor);
}
