package com.mytelmed.common.factory.account;

import com.mytelmed.common.constants.AccountType;
import com.mytelmed.common.events.email.AccountActivatedEvent;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.entity.Permission;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.security.SecureRandom;
import java.util.Base64;


@Component("PHARMACIST")
public class PharmacistAccountFactory implements AccountAbstractFactory {
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher applicationEventPublisher;

    public PharmacistAccountFactory(PasswordEncoder passwordEncoder, ApplicationEventPublisher applicationEventPublisher) {
        this.passwordEncoder = passwordEncoder;
        this.applicationEventPublisher = applicationEventPublisher;
    }

    private String generateRandomPassword() {
        SecureRandom random = new SecureRandom();
        byte[] passwordBytes = new byte[12];
        random.nextBytes(passwordBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(passwordBytes);
    }

    @Override
    public Account createAccount(String email) {
        String rawPassword = generateRandomPassword();
        String encodedPassword = passwordEncoder.encode(rawPassword);

        Permission permission = Permission.builder()
                .type(AccountType.PHARMACIST)
                .build();

        applicationEventPublisher.publishEvent(new AccountActivatedEvent(email, email, rawPassword));

        return Account.builder()
                .username(email)
                .password(encodedPassword)
                .permission(permission)
                .build();
    }

    /**
     * Creates a new account with the specified username and password.
     * This method is not supported for the PharmacistAccountFactory implementation
     * and will throw an UnsupportedOperationException if invoked.
     * Please use {@link #createAccount(String)} instead.
     *
     * @param username the username for the new account
     * @param password the password for the new account
     * @return an {@code Account} object representing the created account
     * @throws UnsupportedOperationException if called on PharmacistAccountFactory
     */
    @Override
    @Deprecated
    public Account createAccount(String username, String password) {
        throw new UnsupportedOperationException("This method is not supported for PharmacistAccountFactory");
    }
}
