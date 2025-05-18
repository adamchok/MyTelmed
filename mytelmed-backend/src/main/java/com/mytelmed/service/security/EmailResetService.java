package com.mytelmed.service.security;

import com.mytelmed.advice.exception.InvalidCredentialsException;
import com.mytelmed.advice.exception.ResourceNotFoundException;
import com.mytelmed.model.entity.Patient;
import com.mytelmed.model.entity.security.ResetToken;
import com.mytelmed.model.entity.security.User;
import com.mytelmed.repository.ResetTokenRepository;
import com.mytelmed.repository.PatientRepository;
import com.mytelmed.service.EmailService;
import com.mytelmed.utils.BlindIndex;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@Service
@Slf4j
public class EmailResetService {
    private final PatientRepository patientRepository;
    private final EmailService emailService;
    private final ResetTokenRepository resetTokenRepository;
    private final String resetBaseUrl;
    private final long tokenExpirationMinutes;

    public EmailResetService(
            PatientRepository patientRepository,
            EmailService emailService,
            ResetTokenRepository resetTokenRepository,
            @Value("${application.security.email-reset.base-url}") String resetBaseUrl,
            @Value("${application.security.password-reset.expiration-minutes}") long tokenExpirationMinutes) {
        this.patientRepository = patientRepository;
        this.emailService = emailService;
        this.resetTokenRepository = resetTokenRepository;
        this.resetBaseUrl = resetBaseUrl;
        this.tokenExpirationMinutes = tokenExpirationMinutes;
    }

    private ResetToken createEmailResetToken(User user) {
        resetTokenRepository.deleteByUser(user);
        ResetToken token = ResetToken.builder()
                .user(user)
                .expiryDate(Instant.now().plus(tokenExpirationMinutes, ChronoUnit.MINUTES))
                .build();
        return resetTokenRepository.save(token);
    }

    private Optional<User> validateEmailResetToken(String token) {
        return resetTokenRepository.findByToken(token)
                .filter(resetToken -> resetToken.getExpiryDate().isAfter(Instant.now()))
                .map(ResetToken::getUser);
    }

    @Transactional
    public void initiateEmailReset(String nric, String phone, String serialNumber, String name, String email) {
        String hashedNric = BlindIndex.sha256(nric);

        Patient patient = patientRepository.findByNricHash(hashedNric)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this NRIC."));

        List<String> mismatches = new ArrayList<>();

        if (!patient.getName().equals(name)) {
            mismatches.add("Full name does not match system records");
            log.warn("Full name mismatch for NRIC: {}", nric);
        }
        if (!patient.getPhone().equals(phone)) {
            mismatches.add("Phone number does not match system records");
            log.warn("Phone number mismatch for NRIC: {}", nric);
        }
        if (!patient.getSerialNumber().equals(serialNumber)) {
            mismatches.add("Serial number does not match system records");
            log.warn("Serial number mismatch for NRIC: {}", nric);
        }

        if (!mismatches.isEmpty()) {
            throw new InvalidCredentialsException(String.join("; ", mismatches));
        }

        User user = patient.getUser();
        ResetToken token = createEmailResetToken(user);
        String resetUrl = resetBaseUrl + "/" + token.getToken();
        emailService.sendEmailResetEmail(email, patient.getName(), resetUrl);
        log.info("Email reset initiated for user: {}", user.getUsername());
    }

    @Transactional
    public void resetEmail(String token, String newEmail) {
        User user = validateEmailResetToken(token)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired email reset link"));
        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("No account found for this user"));
        patient.setEmail(newEmail);
        patientRepository.save(patient);
        resetTokenRepository.deleteByUser(user);
        log.info("Email successfully reset for user: {}", user.getUsername());
    }
}
