package com.portfolio.finance.service;

import com.portfolio.finance.domain.entity.User;
import com.portfolio.finance.dto.profile.ChangePasswordRequest;
import com.portfolio.finance.dto.profile.UpdateProfileRequest;
import com.portfolio.finance.dto.profile.UserProfileResponse;
import com.portfolio.finance.exception.BusinessRuleException;
import com.portfolio.finance.mapper.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final CurrentUserService currentUserService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public ProfileService(CurrentUserService currentUserService, UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.currentUserService = currentUserService;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile() {
        return userMapper.toProfile(currentUserService.getCurrentUser());
    }

    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest request) {
        User user = currentUserService.getCurrentUser();
        user.setName(request.name().trim());
        user.setAccountType(request.accountType());
        user.setThemePreference(request.themePreference());
        return userMapper.toProfile(user);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = currentUserService.getCurrentUser();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BusinessRuleException("A senha atual informada está incorreta.");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
    }
}
