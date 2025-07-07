package com.mytelmed.core.videocall.repository;

import com.mytelmed.core.videocall.entity.VideoCall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface VideoCallRepository extends JpaRepository<VideoCall, UUID> {
    Optional<VideoCall> findByAppointmentId(UUID appointmentId);
}
