package com.mytelmed.common.factory.account;

import com.mytelmed.common.constant.AccountType;
import com.mytelmed.common.event.account.model.AccountCreatedEvent;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.entity.Permission;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.security.SecureRandom;
import java.util.Base64;

@Component("ADMIN")
public class AdminAccountFactory implements AccountAbstractFactory {
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher applicationEventPublisher;

    public AdminAccountFactory(PasswordEncoder passwordEncoder, ApplicationEventPublisher applicationEventPublisher) {
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
    @Deprecated
    public Account createAccount(String email, String name) {
        String rawPassword = generateRandomPassword();
        String encodedPassword = passwordEncoder.encode(rawPassword);

        Permission permission = Permission.builder()
                .type(AccountType.ADMIN)
                .build();

        applicationEventPublisher.publishEvent(new AccountCreatedEvent(email, name, email, rawPassword));

        return Account.builder()
                .username(email)
                .password(encodedPassword)
                .permission(permission)
                .build();
    }

    /**
     * Creates a new account with the specified email and auto-generated password.
     * This method is not supported for the AdminAccountFactory implementation
     * and will throw an UnsupportedOperationException if invoked.
     * Please use {@link #createAccount(String, String)} instead.
     *
     * @param username the username for the new account
     * @param password the password for the new account
     * @param name     the name for the user
     * @return an {@code Account} object representing the created account
     * @throws UnsupportedOperationException if called on AdminAccountFactory
     */
    @Override
    public Account createAccount(String username, String password, String name) {
        throw new UnsupportedOperationException("This method is not supported for AdminAccountFactory");
    }
}
