package com.mytelmed.service.security;

import com.mytelmed.constant.PermissionType;
import com.mytelmed.model.entity.security.Permission;
import com.mytelmed.model.entity.security.User;
import com.mytelmed.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;


@Slf4j
@Service
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userOpt = userRepository.findByUsername(username);
        return userOpt.orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    @Transactional
    public User createAndReturnUser(User user, PermissionType permissionType) {
        try {
            Permission permission = Permission.builder()
                    .user(user)
                    .permissionType(permissionType)
                    .build();
            user.setPermissions(Collections.singletonList(permission));
            return userRepository.save(user);
        } catch (Exception e) {
            log.error("Error creating user: {}", e.getMessage());
        }
        return null;
    }

    public boolean isUserExists(String username) {
        return userRepository.findByUsername(username).isPresent();
    }
}