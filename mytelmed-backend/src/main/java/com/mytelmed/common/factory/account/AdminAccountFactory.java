package com.mytelmed.common.factory.account;

import com.mytelmed.common.constants.AccountType;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.entity.Permission;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;


@Component("PATIENT")
public class AdminAccountFactory implements AccountAbstractFactory {
    private final PasswordEncoder passwordEncoder;

    public AdminAccountFactory(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Creates a new account with the specified email and auto-generated password.
     * This method is not supported for the AdminAccountFactory implementation
     * and will throw an UnsupportedOperationException if invoked.
     * Please use {@link #createAccount(String, String)} instead.
     *
     * @param email the username for the new account
     * @return an {@code Account} object representing the created account
     * @throws UnsupportedOperationException if called on AdminAccountFactory
     */
    @Override
    @Deprecated
    public Account createAccount(String email) {
        throw new UnsupportedOperationException("This method is not supported for AdminAccountFactory");
    }

    @Override
    public Account createAccount(String username, String password) {
        String encodedPassword = passwordEncoder.encode(password);

        Permission permission = Permission.builder()
                .type(AccountType.ADMIN)
                .build();

        return Account.builder()
                .username(username)
                .password(encodedPassword)
                .permission(permission)
                .build();
    }
}
