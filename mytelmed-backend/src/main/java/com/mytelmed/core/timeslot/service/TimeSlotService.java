package com.mytelmed.core.timeslot.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.doctor.service.DoctorService;
import com.mytelmed.core.timeslot.dto.CreateTimeSlotRequestDto;
import com.mytelmed.core.timeslot.dto.UpdateTimeSlotRequestDto;
import com.mytelmed.core.timeslot.entity.TimeSlot;
import com.mytelmed.core.timeslot.repository.TimeSlotRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class TimeSlotService {
    private final TimeSlotRepository timeSlotRepository;
    private final DoctorService doctorService;

    public TimeSlotService(TimeSlotRepository timeSlotRepository, DoctorService doctorService) {
        this.timeSlotRepository = timeSlotRepository;
        this.doctorService = doctorService;
    }

    @Transactional(readOnly = true)
    public TimeSlot findById(UUID id) throws ResourceNotFoundException {
        log.debug("Finding time slot by ID {}", id);

        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found"));

        log.debug("Found time slot with ID {}", id);
        return timeSlot;
    }

    @Transactional(readOnly = true)
    public List<TimeSlot> findAvailableSlotsByDoctorId(UUID doctorId, LocalDateTime startDate, LocalDateTime endDate) {
        return timeSlotRepository.findAvailableSlotsByDoctorId(doctorId, startDate, endDate);
    }

    @Transactional(readOnly = true)
    public List<TimeSlot> findByAccount(Account account, LocalDateTime fromDate) throws AppException {
        log.debug("Finding time slots with doctor account ID {}", account.getId());

        try {
            Doctor doctor = doctorService.findByAccount(account);

            // If no fromDate is provided, return all time slots (starting from a very early
            // date)
            LocalDateTime searchFromDate = fromDate != null ? fromDate : LocalDateTime.now().minusYears(1);

            return timeSlotRepository.findSlotsByDoctorId(doctor.getId(), searchFromDate);
        } catch (Exception e) {
            log.error("Error getting time slots for doctor account {}", account.getId(), e);
            throw new AppException("Failed to get time slots");
        }
    }

    @Transactional
    public void create(Account account, CreateTimeSlotRequestDto request) throws AppException {
        log.debug("Creating time slot for doctor account ID {}", account.getId());

        // Find the doctor by account
        Doctor doctor = doctorService.findByAccount(account);

        // Validate the time slot request
        validateTimeSlotRequest(request.startTime(), request.endTime(), request.durationMinutes());

        // Check for overlapping time slots with pessimistic locking
        if (timeSlotRepository
                .hasOverlappingTimeSlotsWithLock(doctor.getId(), request.startTime(), request.endTime())) {
            // Get details about overlapping slots for better error reporting
            List<TimeSlot> overlappingSlots = timeSlotRepository.findOverlappingTimeSlots(
                    doctor.getId(), request.startTime(), request.endTime());

            log.warn("Attempted to create overlapping time slot for doctor {} from {} to {}. " +
                    "Found {} overlapping slots: {}",
                    doctor.getId(), request.startTime(), request.endTime(),
                    overlappingSlots.size(),
                    overlappingSlots.stream()
                            .map(ts -> String.format("[%s to %s]", ts.getStartTime(), ts.getEndTime()))
                            .toList());

            throw new AppException("Time slot overlaps with existing appointments. Please choose a different time.");
        }

        try {
            // Create the time slot
            TimeSlot timeSlot = TimeSlot.builder()
                    .doctor(doctor)
                    .startTime(request.startTime())
                    .endTime(request.endTime())
                    .durationMinutes(request.durationMinutes())
                    .consultationMode(request.consultationMode())
                    .isAvailable(true)
                    .isBooked(false)
                    .build();

            // Save time slot
            timeSlotRepository.save(timeSlot);

            log.info("Created time slot {} for doctor {}", timeSlot.getId(), doctor.getId());
        } catch (Exception e) {
            log.error("Error creating time slot for account {}", account.getId(), e);
            throw new AppException("Failed to create time slot");
        }
    }

    /**
     * Thread-safe method to book a time slot using pessimistic locking
     */
    @Transactional
    public TimeSlot bookTimeSlotSafely(UUID timeSlotId) throws AppException {
        log.debug("Booking time slot with ID {} safely", timeSlotId);

        // Get time slot with pessimistic lock
        TimeSlot timeSlot = timeSlotRepository.findByIdWithLock(timeSlotId)
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found"));

        // Validate time slot is available for booking
        if (timeSlot.getIsBooked()) {
            throw new AppException("Time slot is already booked");
        }

        if (!timeSlot.getIsAvailable()) {
            throw new AppException("Time slot is not available");
        }

        // Validate time slot is not in the past
        if (timeSlot.getStartTime().isBefore(LocalDateTime.now())) {
            throw new AppException("Cannot book time slot in the past");
        }

        // Mark as booked
        timeSlot.setIsBooked(true);

        // Save and return the locked time slot
        return timeSlotRepository.save(timeSlot);
    }

    /**
     * Thread-safe method to release a time slot booking
     */
    @Transactional
    public void releaseTimeSlotSafely(UUID timeSlotId) throws AppException {
        log.debug("Releasing time slot booking with ID {} safely", timeSlotId);

        // Get time slot with pessimistic lock
        TimeSlot timeSlot = timeSlotRepository.findByIdWithLock(timeSlotId)
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found"));

        // Mark as not booked and available
        timeSlot.setIsBooked(false);
        timeSlot.setIsAvailable(true);

        timeSlotRepository.save(timeSlot);
        log.info("Released time slot booking with ID {}", timeSlotId);
    }

    @Transactional
    public void update(Account account, UUID timeSlotId, UpdateTimeSlotRequestDto request) throws AppException {
        // Find the doctor by account
        Doctor doctor = doctorService.findByAccount(account);

        // Find time slot by ID
        TimeSlot timeSlot = findById(timeSlotId);

        // Verify ownership
        if (!timeSlot.getDoctor().getId().equals(doctor.getId())) {
            throw new AppException("Unauthorized to update this time slot");
        }

        // Verify if the time slot can be updated
        if (timeSlot.getIsBooked()) {
            throw new AppException("Cannot update time slot with existing bookings");
        }

        // Validate new update request
        validateTimeSlotRequest(request.startTime(), request.endTime(), request.durationMinutes());

        // Check for overlapping time slots (excluding the current one)
        if (timeSlotRepository.hasOverlappingTimeSlotsExcluding(
                doctor.getId(), request.startTime(), request.endTime(), timeSlotId)) {
            log.warn("Attempted to update time slot {} with overlapping time period for doctor {} from {} to {}",
                    timeSlotId, doctor.getId(), request.startTime(), request.endTime());
            throw new AppException("Overlapping time slot exists for this time period");
        }

        try {
            // Update the time slot
            timeSlot.setStartTime(request.startTime());
            timeSlot.setEndTime(request.endTime());
            timeSlot.setDurationMinutes(request.durationMinutes());

            // Save time slot
            timeSlotRepository.save(timeSlot);

            log.info("Updated time slot {} for doctor {}", timeSlotId, doctor.getId());
        } catch (Exception e) {
            log.error("Error updating time slot {}", timeSlotId, e);
            throw new AppException("Failed to update time slot");
        }
    }

    @Transactional
    public void enableTimeSlotById(Account account, UUID timeSlotId) throws AppException {
        // Find the doctor by account
        Doctor doctor = doctorService.findByAccount(account);

        // Find the time slot by ID
        TimeSlot timeSlot = findById(timeSlotId);

        // Verify ownership
        if (!timeSlot.getDoctor().getId().equals(doctor.getId())) {
            throw new AppException("Unauthorized to modify this time slot");
        }

        // Check if the time slot has bookings
        if (timeSlot.getIsBooked()) {
            throw new AppException("Cannot modify time slot with existing bookings");
        }

        try {
            // Enable time slot
            timeSlot.setIsAvailable(true);

            // Save time slot
            timeSlotRepository.save(timeSlot);

            log.info("Enabled time slot {} for doctor {}", timeSlotId, doctor.getId());
        } catch (Exception e) {
            log.error("Error enabling time slot availability {}", timeSlotId, e);
            throw new AppException("Failed to enable time slot availability");
        }
    }

    @Transactional
    public void disableTimeSlotById(Account account, UUID timeSlotId) throws AppException {
        // Find the doctor by account
        Doctor doctor = doctorService.findByAccount(account);

        // Find time slot by ID
        TimeSlot timeSlot = findById(timeSlotId);

        // Verify ownership
        if (!timeSlot.getDoctor().getId().equals(doctor.getId())) {
            throw new AppException("Unauthorized to modify this time slot");
        }

        // Check if the time slot has bookings
        if (timeSlot.getIsBooked()) {
            throw new AppException("Cannot modify time slot with existing bookings");
        }

        try {
            // Disable time slot
            timeSlot.setIsAvailable(false);

            // Save time slot
            timeSlotRepository.save(timeSlot);

            log.info("Disabled time slot {} for doctor {}", timeSlotId, doctor.getId());
        } catch (Exception e) {
            log.error("Error disabling time slot availability {}", timeSlotId, e);
            throw new AppException("Failed to disable time slot availability");
        }
    }

    private void validateTimeSlotRequest(LocalDateTime startTime, LocalDateTime endTime, Integer durationMinutes)
            throws AppException {
        // Validate start time is not in the past
        if (startTime.isBefore(LocalDateTime.now())) {
            throw new AppException("Start time cannot be in the past");
        }

        // Validate end time is after start time
        if (endTime.isBefore(startTime) || endTime.isEqual(startTime)) {
            throw new AppException("End time must be after start time");
        }

        // Validate duration matches the time difference
        Duration duration = Duration.between(startTime, endTime);
        if (duration.toMinutes() != durationMinutes) {
            throw new AppException("Duration does not match the time difference");
        }

        // Validate minimum duration (e.g., 15 minutes)
        if (durationMinutes < 15) {
            throw new AppException("Minimum duration is 15 minutes");
        }

        // Validate maximum duration (e.g., 4 hours)
        if (durationMinutes > 240) {
            throw new AppException("Maximum duration is 4 hours");
        }
    }
}
