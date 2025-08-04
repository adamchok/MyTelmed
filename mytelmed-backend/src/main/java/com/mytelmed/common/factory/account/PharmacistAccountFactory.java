package com.mytelmed.common.factory.account;

import com.mytelmed.common.constant.AccountType;
import com.mytelmed.common.event.account.model.AccountCreatedEvent;
import com.mytelmed.common.utils.PasswordGenerator;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.entity.Permission;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;


@Component("PHARMACIST")
public class PharmacistAccountFactory implements AccountAbstractFactory {
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher applicationEventPublisher;

    public PharmacistAccountFactory(PasswordEncoder passwordEncoder, ApplicationEventPublisher applicationEventPublisher) {
        this.passwordEncoder = passwordEncoder;
        this.applicationEventPublisher = applicationEventPublisher;
    }

    @Override
    public Account createAccount(String email, String name) {
        String rawPassword = PasswordGenerator.generateRandomPassword();
        String encodedPassword = passwordEncoder.encode(rawPassword);

        Permission permission = Permission.builder()
                .type(AccountType.PHARMACIST)
                .build();

        applicationEventPublisher.publishEvent(new AccountCreatedEvent(email, name, AccountType.PHARMACIST.name(),email, rawPassword));

        return Account.builder()
                .username(email)
                .password(encodedPassword)
                .permission(permission)
                .build();
    }

    /**
     * Creates a new account with the specified name and password.
     * This method is not supported for the PharmacistAccountFactory implementation
     * and will throw an UnsupportedOperationException if invoked.
     * Please use {@link #createAccount(String, String)} instead.
     *
     * @param username the name for the new account
     * @param password the password for the new account
     * @param name     the name of the user
     * @return an {@code Account} object representing the created account
     * @throws UnsupportedOperationException if called on PharmacistAccountFactory
     */
    @Override
    @Deprecated
    public Account createAccount(String username, String password, String name) {
        throw new UnsupportedOperationException("This method is not supported for PharmacistAccountFactory");
    }
}
