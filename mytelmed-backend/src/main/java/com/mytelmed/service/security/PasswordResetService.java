package com.mytelmed.service.security;

import com.mytelmed.advice.exception.InvalidCredentialsException;
import com.mytelmed.advice.exception.ResourceNotFoundException;
import com.mytelmed.model.entity.object.Patient;
import com.mytelmed.model.entity.security.ResetToken;
import com.mytelmed.model.entity.security.User;
import com.mytelmed.repository.ResetTokenRepository;
import com.mytelmed.repository.PatientRepository;
import com.mytelmed.repository.UserRepository;
import com.mytelmed.service.EmailService;
import com.mytelmed.utils.BlindIndex;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class PasswordResetService {
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final ResetTokenRepository resetTokenRepository;
    private final String resetBaseUrl;
    private final long tokenExpirationMinutes;

    public PasswordResetService(
            PatientRepository patientRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            ResetTokenRepository resetTokenRepository,
            @Value("${application.security.password-reset.base-url}") String resetBaseUrl,
            @Value("${application.security.password-reset.expiration-minutes}") long tokenExpirationMinutes) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.resetTokenRepository = resetTokenRepository;
        this.resetBaseUrl = resetBaseUrl;
        this.tokenExpirationMinutes = tokenExpirationMinutes;
    }

    private ResetToken createPasswordResetToken(User user) {
        resetTokenRepository.deleteByUser(user);
        ResetToken token = ResetToken.builder()
                .user(user)
                .expiryDate(Instant.now().plus(tokenExpirationMinutes, ChronoUnit.MINUTES))
                .build();
        return resetTokenRepository.save(token);
    }

    private Optional<User> validatePasswordResetToken(String token) {
        return resetTokenRepository.findByToken(token)
                .filter(resetToken -> resetToken.getExpiryDate().isAfter(Instant.now()))
                .map(ResetToken::getUser);
    }

    @Transactional
    public void initiatePasswordReset(String email, String nric) {
        String hashedEmail = BlindIndex.sha256(email);

        Patient patient = patientRepository.findByEmailHash(hashedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email address"));

        if (!patient.getNric().equals(nric)) {
            log.warn("NRIC provided does not match the account: {}", email);
            throw new InvalidCredentialsException("The provided NRIC does not match our records for this email");
        }

        User user = patient.getUser();
        ResetToken token = createPasswordResetToken(user);
        String resetUrl = resetBaseUrl + "/" + token.getToken();
        emailService.sendPasswordResetEmail(email, patient.getName(), resetUrl);
        log.info("Password reset initiated for user: {}", user.getUsername());
    }
    
    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = validatePasswordResetToken(token)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired password reset link"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        resetTokenRepository.deleteByUser(user);
        log.info("Password successfully reset for user: {}", user.getUsername());
    }
}