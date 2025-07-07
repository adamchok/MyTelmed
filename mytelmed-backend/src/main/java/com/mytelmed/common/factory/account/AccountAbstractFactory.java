package com.mytelmed.common.factory.account;

import com.mytelmed.core.auth.entity.Account;


public interface AccountAbstractFactory {
    Account createAccount(String email, String name);

    Account createAccount(String username, String password, String name);
}
