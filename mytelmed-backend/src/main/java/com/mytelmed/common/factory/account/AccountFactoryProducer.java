package com.mytelmed.common.factory.account;

import com.mytelmed.common.constant.AccountType;
import org.springframework.stereotype.Component;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;


@Component
public class AccountFactoryProducer {
    private final Map<AccountType, AccountAbstractFactory> factoryMap = new EnumMap<>(AccountType.class);

    public AccountFactoryProducer(List<AccountAbstractFactory> factories) {
        for (AccountAbstractFactory factory : factories) {
            Component annotation = factory.getClass().getAnnotation(Component.class);
            if (annotation != null) {
                AccountType type = AccountType.valueOf(annotation.value());
                factoryMap.put(type, factory);
            }
        }
    }

    public AccountAbstractFactory getFactory(AccountType type) throws IllegalArgumentException {
        AccountAbstractFactory factory = factoryMap.get(type);
        if (factory == null) {
            throw new IllegalArgumentException("Unsupported account type: " + type);
        }
        return factory;
    }
}
