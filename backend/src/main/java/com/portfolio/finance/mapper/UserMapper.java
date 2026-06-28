package com.portfolio.finance.mapper;

import com.portfolio.finance.domain.entity.User;
import com.portfolio.finance.dto.profile.UserProfileResponse;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserProfileResponse toProfile(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getAccountType(),
                user.getThemePreference(),
                user.getCreatedAt()
        );
    }
}
