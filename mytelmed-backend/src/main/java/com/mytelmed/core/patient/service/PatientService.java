package com.mytelmed.core.patient.service;

import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.utils.HashUtil;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.repository.PatientRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;


@Slf4j
@Service
public class PatientService {
    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public Patient getPatientById(UUID patientId) {
        log.debug("Getting patient with ID: {}", patientId);
        return patientRepository.findById(patientId)
                .orElseThrow(() -> {
                    log.warn("Patient not found with ID: {}", patientId);
                    return new ResourceNotFoundException("Patient not found");
                });
    }

    public Patient getPatientByEmail(String email) {
        log.debug("Getting patient with email: {}", email);
        return patientRepository.findByHashedEmail(HashUtil.sha256(email))
                .orElseThrow(() -> {
                    log.warn("Patient not found with email: {}", email);
                    return new ResourceNotFoundException("Patient not found");
                });
    }

    public Patient getPatientByNric(String nric) {
        log.debug("Getting patient with NRIC: {}", nric);
        return patientRepository.findByHashedNric(HashUtil.sha256(nric))
                .orElseThrow(() -> {
                    log.warn("Patient not found with NRIC: {}", nric);
                    return new ResourceNotFoundException("Patient not found");
                });
    }

    public Patient getPatientByAccountId(UUID accountId) {
        log.debug("Getting patient with account ID: {}", accountId);
        return patientRepository.findByAccountId(accountId)
                .orElseThrow(() -> {
                    log.warn("Patient not found with account ID: {}", accountId);
                    return new ResourceNotFoundException("Patient not found");
                });
    }

    @Transactional
    public Optional<Patient> resetEmailByAccountId(UUID accountId, String newEmail) {
        log.debug("Resetting patient email for account ID: {}", accountId);

        try {
            Patient patient = getPatientByAccountId(accountId);
            patient.setEmail(newEmail);
            return Optional.of(patientRepository.save(patient));
        } catch (Exception e) {
            log.error("Unexpected error while resetting patient email: {}", accountId, e);
            return Optional.empty();
        }
    }
}
