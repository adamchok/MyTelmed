package com.mytelmed.common.scheduler;

import com.mytelmed.common.constant.prescription.PrescriptionStatus;
import com.mytelmed.core.prescription.entity.Prescription;
import com.mytelmed.core.prescription.repository.PrescriptionRepository;
import com.mytelmed.core.delivery.entity.MedicationDelivery;
import com.mytelmed.core.delivery.repository.MedicationDeliveryRepository;
import com.mytelmed.common.constant.delivery.DeliveryStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;

/**
 * Comprehensive prescription scheduler service for Malaysian public healthcare
 * telemedicine system.
 * Handles prescription-related scheduling tasks including:
 * - Auto-expiry of prescriptions past their expiry date
 * - Cancellation of associated pending medication deliveries
 * - Cleanup and maintenance tasks
 * - Prescription lifecycle management
 */
@Slf4j
@Service
public class PrescriptionSchedulerService {

    private final PrescriptionRepository prescriptionRepository;
    private final MedicationDeliveryRepository medicationDeliveryRepository;

    public PrescriptionSchedulerService(
            PrescriptionRepository prescriptionRepository,
            MedicationDeliveryRepository medicationDeliveryRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.medicationDeliveryRepository = medicationDeliveryRepository;
    }

    /**
     * Main scheduler that runs every 15 minutes to handle all prescription-related
     * tasks.
     * Scheduled to align with other system schedulers.
     */
    @Scheduled(cron = "0 */15 * * * *")
    @Async("schedulerExecutor")
    @Transactional
    public void processPrescriptionScheduling() {
        log.info("Starting prescription scheduling process");

        try {
            // Process prescription expiry tasks
            processExpiredPrescriptions();
            processExpiredPrescriptionDeliveries();

            log.info("Completed prescription scheduling process");
        } catch (Exception e) {
            log.error("Error in prescription scheduling process", e);
        }
    }

    /**
     * Process prescriptions that have passed their expiry date and mark them as
     * EXPIRED.
     * Malaysian public healthcare prescriptions expire after 30 days.
     * Only prescriptions not in final states (READY, EXPIRED, CANCELLED) are
     * processed.
     */
    @Transactional
    public void processExpiredPrescriptions() {
        log.info("Processing expired prescriptions");

        Instant now = Instant.now();
        List<Prescription> expiredPrescriptions = prescriptionRepository.findExpiredPrescriptions(now);

        for (Prescription prescription : expiredPrescriptions) {
            try {
                // Validate that prescription is in a state that can be expired
                if (canExpirePrescription(prescription)) {
                    prescription.setStatus(PrescriptionStatus.EXPIRED);
                    prescriptionRepository.save(prescription);

                    log.info("Expired prescription marked: {} (Status: {} → EXPIRED)",
                            maskPrescriptionNumber(prescription.getPrescriptionNumber()),
                            prescription.getStatus());
                } else {
                    log.debug("Prescription {} cannot be expired in current status: {}",
                            maskPrescriptionNumber(prescription.getPrescriptionNumber()),
                            prescription.getStatus());
                }
            } catch (Exception e) {
                log.error("Error processing expired prescription: {}",
                        maskPrescriptionNumber(prescription.getPrescriptionNumber()), e);
            }
        }

        log.info("Processed {} expired prescriptions", expiredPrescriptions.size());
    }

    /**
     * Process medication deliveries for expired prescriptions and cancel pending
     * deliveries.
     * This prevents delivery attempts for expired prescriptions.
     */
    @Transactional
    public void processExpiredPrescriptionDeliveries() {
        log.info("Processing expired prescription deliveries");

        // Find prescriptions that have expired
        Instant now = Instant.now();
        List<Prescription> expiredPrescriptions = prescriptionRepository.findExpiredPrescriptions(now);
        int cancelledDeliveries = 0;

        for (Prescription prescription : expiredPrescriptions) {
            if (prescription.getStatus() == PrescriptionStatus.EXPIRED) {
                try {
                    // Find any active deliveries for this prescription
                    List<MedicationDelivery> activeDeliveries = medicationDeliveryRepository
                            .findAllByPrescriptionIdOrderByCreatedAtDesc(prescription.getId());

                    for (MedicationDelivery delivery : activeDeliveries) {
                        // Only cancel deliveries that are not in final states
                        if (delivery.getStatus() == DeliveryStatus.PENDING_PAYMENT ||
                                delivery.getStatus() == DeliveryStatus.PENDING_PICKUP) {

                            delivery.setStatus(DeliveryStatus.CANCELLED);
                            delivery.setCancellationReason("Prescription expired");
                            medicationDeliveryRepository.save(delivery);
                            cancelledDeliveries++;

                            log.info("Cancelled delivery {} for expired prescription: {}",
                                    delivery.getId(),
                                    maskPrescriptionNumber(prescription.getPrescriptionNumber()));
                        }
                    }
                } catch (Exception e) {
                    log.error("Error processing deliveries for expired prescription: {}",
                            maskPrescriptionNumber(prescription.getPrescriptionNumber()), e);
                }
            }
        }

        log.info("Cancelled {} deliveries for expired prescriptions", cancelledDeliveries);
    }

    /**
     * Check if a prescription can be marked as expired based on its current status.
     * Only prescriptions in active states should be expired.
     */
    private boolean canExpirePrescription(Prescription prescription) {
        PrescriptionStatus status = prescription.getStatus();
        return status == PrescriptionStatus.CREATED ||
                status == PrescriptionStatus.READY_FOR_PROCESSING ||
                status == PrescriptionStatus.PROCESSING;
    }

    /**
     * Mask prescription number for logging privacy.
     * Format: RX****1234 (shows prefix and last 4 characters)
     */
    private String maskPrescriptionNumber(String prescriptionNumber) {
        if (prescriptionNumber == null || !prescriptionNumber.startsWith("RX") || prescriptionNumber.length() <= 6) {
            return "RX****";
        }

        String prefix = "RX";
        String middlePart = prescriptionNumber.substring(2, prescriptionNumber.length() - 4);
        String maskedMiddle = "*".repeat(middlePart.length());
        String lastFour = prescriptionNumber.substring(prescriptionNumber.length() - 4);

        return prefix + maskedMiddle + lastFour;
    }
}