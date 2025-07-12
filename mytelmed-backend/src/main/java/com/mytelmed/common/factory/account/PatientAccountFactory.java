package com.mytelmed.common.factory.account;

import com.mytelmed.common.constant.AccountType;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.entity.Permission;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;


@Component("PATIENT")
public class PatientAccountFactory implements AccountAbstractFactory {
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher applicationEventPublisher;

    public PatientAccountFactory(PasswordEncoder passwordEncoder, ApplicationEventPublisher applicationEventPublisher) {
        this.passwordEncoder = passwordEncoder;
        this.applicationEventPublisher = applicationEventPublisher;
    }

    /**
     * Creates a new account with the specified email and auto-generated password.
     * This method is not supported for the PatientAccountFactory implementation
     * and will throw an UnsupportedOperationException if invoked.
     * Please use {@link #createAccount(String, String, String)} instead.
     *
     * @param email the name for the new account
     * @param name  the name for the user
     * @return an {@code Account} object representing the created account
     * @throws UnsupportedOperationException if called on PatientAccountFactory
     */
    @Override
    @Deprecated
    public Account createAccount(String email, String name) {
        throw new UnsupportedOperationException("This method is not supported for PatientAccountFactory");
    }

    @Override
    public Account createAccount(String username, String password, String name) {
        String encodedPassword = passwordEncoder.encode(password);

        Permission permission = Permission.builder()
                .type(AccountType.PATIENT)
                .build();
        
        return Account.builder()
                .username(username)
                .password(encodedPassword)
                .permission(permission)
                .build();
    }
}
