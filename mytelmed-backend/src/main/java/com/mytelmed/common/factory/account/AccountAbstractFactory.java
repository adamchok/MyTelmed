package com.mytelmed.common.factory.account;

import com.mytelmed.core.auth.entity.Account;


public interface AccountAbstractFactory {
    Account createAccount(String email);

    Account createAccount(String username, String password);
}
