package com.mytelmed.common.scheduler;

import com.mytelmed.common.constant.appointment.AppointmentStatus;
import com.mytelmed.common.constant.appointment.ConsultationMode;
import com.mytelmed.common.constant.payment.BillingStatus;
import com.mytelmed.common.event.appointment.model.AppointmentCancelledEvent;
import com.mytelmed.common.event.appointment.model.AppointmentConfirmedEvent;
import com.mytelmed.common.event.appointment.model.AppointmentReminderEvent;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.appointment.repository.AppointmentRepository;
import com.mytelmed.core.appointment.service.AppointmentStateMachine;
import com.mytelmed.core.payment.entity.Bill;
import com.mytelmed.core.payment.entity.PaymentTransaction;
import com.mytelmed.core.payment.repository.BillRepository;
import com.mytelmed.core.payment.repository.PaymentTransactionRepository;
import com.mytelmed.core.payment.service.PaymentRefundService;
import com.mytelmed.core.timeslot.service.TimeSlotService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;


/**
 * Comprehensive appointment scheduler service for Malaysian public healthcare
 * telemedicine system.
 * Handles all appointment-related scheduling tasks including:
 * - Auto-confirmation of paid appointments (PENDING → CONFIRMED)
 * - Auto-cancellation of unpaid appointments
 * - Virtual appointment flow: CONFIRMED → READY_FOR_CALL → IN_PROGRESS →
 * COMPLETED
 * - Physical appointment flow: CONFIRMED → IN_PROGRESS → COMPLETED
 * - Appointment reminders and notifications
 * - No-show handling and cleanup tasks
 */
@Slf4j
@Service
public class AppointmentSchedulerService {

    private final AppointmentRepository appointmentRepository;
    private final BillRepository billRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final TimeSlotService timeSlotService;
    private final ApplicationEventPublisher eventPublisher;
    private final PaymentRefundService paymentRefundService;
    private final AppointmentStateMachine appointmentStateMachine;

    public AppointmentSchedulerService(
            AppointmentRepository appointmentRepository,
            BillRepository billRepository,
            PaymentTransactionRepository paymentTransactionRepository,
            TimeSlotService timeSlotService,
            ApplicationEventPublisher eventPublisher,
            PaymentRefundService paymentRefundService,
            AppointmentStateMachine appointmentStateMachine) {
        this.appointmentRepository = appointmentRepository;
        this.billRepository = billRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.timeSlotService = timeSlotService;
        this.eventPublisher = eventPublisher;
        this.paymentRefundService = paymentRefundService;
        this.appointmentStateMachine = appointmentStateMachine;
    }

    /**
     * Main scheduler that runs every 15 minutes to handle all appointment-related
     * tasks.
     * Scheduled to align with 15-minute appointment intervals.
     */
    @Scheduled(cron = "*/15 * * * * *")
    @Async("schedulerExecutor")
    @Transactional
    public void processAppointmentScheduling() {
        log.info("Starting appointment scheduling process");

        try {
            // Process automated status transitions in order
            processAppointmentAutoConfirmation(); // PENDING → CONFIRMED for paid appointments
            processUnpaidAppointmentCancellation(); // PENDING_PAYMENT → CANCELLED for unpaid appointments
            processVirtualAppointmentReadyForCall(); // CONFIRMED → READY_FOR_CALL for virtual appointments
            processPhysicalAppointmentInProgress(); // CONFIRMED → IN_PROGRESS for physical appointments

            // Process general appointment tasks
            processAppointmentReminders();
            processNoShowAppointments();
            processExpiredAppointmentCleanup();

            log.info("Completed appointment scheduling process");
        } catch (Exception e) {
            log.error("Error in appointment scheduling process", e);
        }
    }

    /**
     * Auto-confirm paid appointments 12 hours before scheduled time.
     * Both virtual and physical appointments in PENDING status that are paid should
     * be moved to CONFIRMED.
     */
    @Transactional
    public void processAppointmentAutoConfirmation() {
        log.debug("Processing appointment auto-confirmation (PENDING → CONFIRMED)");

        // TODO: Uncomment for production:
//        LocalDateTime now = LocalDateTime.now();
//        LocalDateTime confirmationThreshold = now.plusHours(12);
//
//        List<Appointment> pendingAppointments = appointmentRepository
//                .findByStatusAndTimeSlotStartTimeBefore(
//                        AppointmentStatus.PENDING,
//                        confirmationThreshold);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourFromNow = now.plusWeeks(2);

        List<Appointment> pendingAppointments = appointmentRepository
                .findByStatusAndStartTimeBetween(
                        AppointmentStatus.PENDING,
                        now,
                        oneHourFromNow);


        for (Appointment appointment : pendingAppointments) {
            try {
                // Check if appointment requires payment and if it's paid
                boolean requiresPayment = appointmentStateMachine
                        .requiresPaymentBeforeConfirmation(appointment.getConsultationMode());
                boolean isPaid = true; // Default for physical appointments

                if (requiresPayment) {
                    Optional<Bill> billOpt = billRepository.findByAppointmentId(appointment.getId());
                    isPaid = billOpt.isPresent() && billOpt.get().getBillingStatus() == BillingStatus.PAID;
                }

                if (isPaid) {
                    // Use state machine to validate and perform transition
                    appointmentStateMachine.validateTransition(
                            appointment.getStatus(),
                            AppointmentStatus.CONFIRMED,
                            appointment.getConsultationMode());

                    appointment.setStatus(AppointmentStatus.CONFIRMED);
                    appointmentRepository.save(appointment);

                    // Publish confirmation event
                    publishAppointmentConfirmedEvent(appointment);

                    log.info("Auto-confirmed {} appointment: {} (PENDING → CONFIRMED)",
                            appointment.getConsultationMode(), appointment.getId());
                }
            } catch (Exception e) {
                log.error("Error auto-confirming appointment: {}", appointment.getId(), e);
            }
        }
    }

    /**
     * Auto-cancel unpaid appointments after 30 minutes of booking time.
     * Cancels billing, transactions, and releases time slot.
     */
    @Transactional
    public void processUnpaidAppointmentCancellation() {
        log.debug("Processing unpaid appointment cancellation (PENDING_PAYMENT → CANCELLED)");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cancellationThreshold = now.minusMinutes(30);

        List<Appointment> unpaidAppointments = appointmentRepository
                .findByStatusAndCreatedAtBefore(
                        AppointmentStatus.PENDING_PAYMENT,
                        cancellationThreshold.atZone(ZoneId.systemDefault()).toInstant());

        for (Appointment appointment : unpaidAppointments) {
            try {
                // Use state machine to validate transition
                appointmentStateMachine.validateTransition(
                        appointment.getStatus(),
                        AppointmentStatus.CANCELLED,
                        appointment.getConsultationMode());

                // Cancel the appointment
                appointment.setStatus(AppointmentStatus.CANCELLED);
                appointment.setCancellationReason("Auto-cancelled due to non-payment within 30 minutes");
                appointmentRepository.save(appointment);

                // Cancel associated bill
                Optional<Bill> billOpt = billRepository.findByAppointmentId(appointment.getId());
                if (billOpt.isPresent()) {
                    Bill bill = billOpt.get();
                    bill.setBillingStatus(BillingStatus.CANCELLED);
                    billRepository.save(bill);

                    // Cancel associated payment transaction
                    Optional<PaymentTransaction> transactionOpt = paymentTransactionRepository
                            .findByBillId(bill.getId());
                    if (transactionOpt.isPresent()) {
                        PaymentTransaction transaction = transactionOpt.get();
                        transaction.setStatus(PaymentTransaction.TransactionStatus.CANCELLED);
                        paymentTransactionRepository.save(transaction);
                    }
                }

                // Release the time slot
                timeSlotService.releaseTimeSlotSafely(appointment.getTimeSlot().getId());

                // Publish cancellation event
                publishAppointmentCancelledEvent(appointment);

                log.info("Auto-cancelled unpaid appointment: {} after 3 hours (PENDING_PAYMENT → CANCELLED)",
                        appointment.getId());
            } catch (Exception e) {
                log.error("Error auto-cancelling unpaid appointment: {}", appointment.getId(), e);
            }
        }
    }

    /**
     * Mark CONFIRMED virtual appointments as READY_FOR_CALL 15 minutes before
     * scheduled time.
     * This allows patients and family members to create stream calls.
     */
    @Transactional
    public void processVirtualAppointmentReadyForCall() {
        log.debug("Processing READY_FOR_CALL transition (CONFIRMED → READY_FOR_CALL for virtual appointments)");

        // TODO: Uncomment for production:
//        LocalDateTime now = LocalDateTime.now();
//        LocalDateTime readyThreshold = now.plusMinutes(15);
//
//        List<Appointment> confirmedVirtualAppointments = appointmentRepository
//                .findByStatusAndConsultationModeAndTimeSlotStartTimeBefore(
//                        AppointmentStatus.CONFIRMED,
//                        ConsultationMode.VIRTUAL,
//                        readyThreshold);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime readyWindowEnd = now.plusWeeks(2);

        List<Appointment> confirmedVirtualAppointments = appointmentRepository.findByStatusAndStartTimeBetween(
                AppointmentStatus.CONFIRMED, now, readyWindowEnd);

        for (Appointment appointment : confirmedVirtualAppointments) {
            try {
                // Use state machine to validate transition
                appointmentStateMachine.validateTransition(
                        appointment.getStatus(),
                        AppointmentStatus.READY_FOR_CALL,
                        appointment.getConsultationMode());

                appointment.setStatus(AppointmentStatus.READY_FOR_CALL);
                appointmentRepository.save(appointment);

                log.info("Marked virtual appointment as READY_FOR_CALL: {} (CONFIRMED → READY_FOR_CALL)", appointment.getId());
            } catch (Exception e) {
                log.error("Error marking virtual appointment as READY_FOR_CALL: {}", appointment.getId(), e);
            }
        }
    }

    /**
     * Mark CONFIRMED physical appointments as IN_PROGRESS when appointment time
     * arrives.
     * Physical appointments start exactly at their scheduled time.
     */
    @Transactional
    public void processPhysicalAppointmentInProgress() {
        log.debug("Processing IN_PROGRESS transition (CONFIRMED → IN_PROGRESS for physical appointments)");

        LocalDateTime now = LocalDateTime.now();

        List<Appointment> confirmedPhysicalAppointments = appointmentRepository
                .findByStatusAndConsultationModeAndTimeSlotStartTimeBefore(
                        AppointmentStatus.CONFIRMED,
                        ConsultationMode.PHYSICAL,
                        now);

        for (Appointment appointment : confirmedPhysicalAppointments) {
            try {
                // Use state machine to validate transition
                appointmentStateMachine.validateTransition(
                        appointment.getStatus(),
                        AppointmentStatus.IN_PROGRESS,
                        appointment.getConsultationMode());

                appointment.setStatus(AppointmentStatus.IN_PROGRESS);
                appointmentRepository.save(appointment);

                log.info("Marked physical appointment as IN_PROGRESS: {} (CONFIRMED → IN_PROGRESS)", appointment.getId());
            } catch (Exception e) {
                log.error("Error marking physical appointment as IN_PROGRESS: {}", appointment.getId(), e);
            }
        }
    }

    /**
     * Send appointment reminders:
     * - 6 hours before appointment (for both virtual and physical)
     * - 1 hour before appointment (for virtual appointments)
     */
    @Transactional(readOnly = true)
    public void processAppointmentReminders() {
        log.debug("Processing appointment reminders");

        LocalDateTime now = LocalDateTime.now();

        // 6-hour reminders
        LocalDateTime reminder6h = now.plusHours(6);
        List<Appointment> appointments6h = appointmentRepository
                .findUpcomingAppointmentsForReminder(reminder6h, reminder6h.plusMinutes(15));

        for (Appointment appointment : appointments6h) {
            publishAppointmentReminderEvent(appointment, 6L);
        }

        // 1-hour reminders for virtual appointments
        LocalDateTime reminder1h = now.plusHours(1);
        List<Appointment> virtualAppointments1h = appointmentRepository
                .findByStatusInAndConsultationModeAndTimeSlotStartTimeBetween(
                        List.of(AppointmentStatus.CONFIRMED, AppointmentStatus.READY_FOR_CALL),
                        ConsultationMode.VIRTUAL,
                        reminder1h,
                        reminder1h.plusMinutes(15));

        for (Appointment appointment : virtualAppointments1h) {
            publishAppointmentReminderEvent(appointment, 1L);
        }
    }

    /**
     * Mark appointments as NO_SHOW if they haven't started 30 minutes after
     * scheduled time.
     * This applies to both virtual and physical appointments.
     */
    @Transactional
    public void processNoShowAppointments() {
        log.debug("Processing no-show appointments");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime noShowThreshold = now.minusMinutes(30);

        // Find appointments that should have started but are still
        // pending/confirmed/ready
        List<Appointment> potentialNoShows = appointmentRepository
                .findByStatusInAndTimeSlotStartTimeBefore(
                        List.of(AppointmentStatus.CONFIRMED, AppointmentStatus.READY_FOR_CALL),
                        noShowThreshold);

        for (Appointment appointment : potentialNoShows) {
            try {
                // Use state machine to validate transition
                appointmentStateMachine.validateTransition(
                        appointment.getStatus(),
                        AppointmentStatus.NO_SHOW,
                        appointment.getConsultationMode());

                appointment.setStatus(AppointmentStatus.NO_SHOW);
                appointmentRepository.save(appointment);

                // Release the time slot
                timeSlotService.releaseTimeSlotSafely(appointment.getTimeSlot().getId());

                log.info("Marked appointment as NO_SHOW: {} ({} → NO_SHOW)",
                        appointment.getId(), appointment.getStatus());
            } catch (Exception e) {
                log.error("Error marking appointment as NO_SHOW: {}", appointment.getId(), e);
            }
        }
    }

    /**
     * Clean up old cancelled and completed appointments.
     * Archive appointments older than 90 days for compliance and performance.
     */
    @Transactional(readOnly = true)
    public void processExpiredAppointmentCleanup() {
        log.debug("Processing expired appointment cleanup");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime archiveThreshold = now.minusDays(90);

        // Count old appointments for logging
        long oldAppointmentsCount = appointmentRepository
                .countByStatusInAndUpdatedAtBefore(
                        List.of(AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW),
                        archiveThreshold.atZone(ZoneId.systemDefault()).toInstant());

        if (oldAppointmentsCount > 0) {
            log.info("Found {} appointments eligible for archival (older than 90 days)", oldAppointmentsCount);
            // Note: Actual archival logic would depend on business requirements
            // This could involve moving to archive tables or marking for deletion
        }
    }

    /**
     * Emergency scheduler that runs every 5 minutes for critical tasks.
     * Handles urgent appointment status transitions and system health checks.
     */
    @Scheduled(cron = "0 */5 * * * *") // Every 5 minutes
    @Async("schedulerExecutor")
    public void processEmergencyAppointmentTasks() {
        log.debug("Running emergency appointment tasks");

        try {
            // Handle critical virtual appointment transitions
            processVirtualAppointmentTimeouts();

            // Check for stuck appointments in transitional states
            processStuckAppointments();

        } catch (Exception e) {
            log.error("Error in emergency appointment tasks", e);
        }
    }

    /**
     * Handle virtual appointments that have been IN_PROGRESS for too long.
     * Auto-complete them after 2 hours to prevent stuck states.
     */
    @Transactional
    public void processVirtualAppointmentTimeouts() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime timeoutThreshold = now.minusHours(2);

        List<Appointment> timeoutAppointments = appointmentRepository
                .findByStatusAndConsultationModeAndUpdatedAtBefore(
                        AppointmentStatus.IN_PROGRESS,
                        ConsultationMode.VIRTUAL,
                        timeoutThreshold.atZone(ZoneId.systemDefault()).toInstant());

        for (Appointment appointment : timeoutAppointments) {
            try {
                // Use state machine to validate transition
                appointmentStateMachine.validateTransition(
                        appointment.getStatus(),
                        AppointmentStatus.COMPLETED,
                        appointment.getConsultationMode());

                appointment.setStatus(AppointmentStatus.COMPLETED);
                appointment.setDoctorNotes("Auto-completed due to session timeout after 2 hours");
                appointment.setCompletedAt(java.time.Instant.now());
                appointmentRepository.save(appointment);

                log.warn("Auto-completed virtual appointment due to timeout: {} (IN_PROGRESS → COMPLETED)",
                        appointment.getId());
            } catch (Exception e) {
                log.error("Error auto-completing timeout appointment: {}", appointment.getId(), e);
            }
        }
    }

    /**
     * Check for appointments stuck in transitional states and attempt recovery.
     */
    @Transactional
    public void processStuckAppointments() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime stuckThreshold = now.minusHours(6);

        // Find appointments that have been in PENDING_PAYMENT for more than 6 hours
        List<Appointment> stuckPendingPayment = appointmentRepository
                .findByStatusAndUpdatedAtBefore(
                        AppointmentStatus.PENDING_PAYMENT,
                        stuckThreshold.atZone(ZoneId.systemDefault()).toInstant());

        for (Appointment appointment : stuckPendingPayment) {
            log.warn("Found stuck appointment in PENDING_PAYMENT state: {} - will be handled by 3-hour cancellation process",
                    appointment.getId());
            // These will be handled by the regular 3-hour cancellation process
        }
    }

    private void publishAppointmentConfirmedEvent(Appointment appointment) {
        try {
            AppointmentConfirmedEvent event = AppointmentConfirmedEvent.builder()
                    .appointmentId(appointment.getId())
                    .patient(appointment.getPatient())
                    .doctor(appointment.getDoctor())
                    .appointmentDateTime(appointment.getTimeSlot().getStartTime())
                    .consultationMode(appointment.getConsultationMode())
                    .build();

            eventPublisher.publishEvent(event);
            log.debug("Published AppointmentConfirmedEvent for appointment {}", appointment.getId());
        } catch (Exception e) {
            log.error("Failed to publish AppointmentConfirmedEvent for appointment {}", appointment.getId(), e);
        }
    }

    private void publishAppointmentCancelledEvent(Appointment appointment) {
        try {
            AppointmentCancelledEvent event = AppointmentCancelledEvent.builder()
                    .appointmentId(appointment.getId())
                    .patient(appointment.getPatient())
                    .doctor(appointment.getDoctor())
                    .appointmentDateTime(appointment.getTimeSlot().getStartTime())
                    .consultationMode(appointment.getConsultationMode())
                    .cancellationReason(appointment.getCancellationReason())
                    .build();

            eventPublisher.publishEvent(event);
            log.debug("Published AppointmentCancelledEvent for appointment {}", appointment.getId());
        } catch (Exception e) {
            log.error("Failed to publish AppointmentCancelledEvent for appointment {}", appointment.getId(), e);
        }
    }

    private void publishAppointmentReminderEvent(Appointment appointment, long hoursUntilAppointment) {
        try {
            AppointmentReminderEvent event = AppointmentReminderEvent.builder()
                    .appointmentId(appointment.getId())
                    .patient(appointment.getPatient())
                    .doctor(appointment.getDoctor())
                    .appointmentDateTime(appointment.getTimeSlot().getStartTime())
                    .consultationMode(appointment.getConsultationMode())
                    .hoursUntilAppointment(hoursUntilAppointment)
                    .build();

            eventPublisher.publishEvent(event);
            log.debug("Published AppointmentReminderEvent ({}_HOURS) for appointment {}", hoursUntilAppointment,
                    appointment.getId());
        } catch (Exception e) {
            log.error("Failed to publish AppointmentReminderEvent for appointment {}", appointment.getId(), e);
        }
    }
}