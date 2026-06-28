package com.portfolio.finance.dto.auth;

import com.portfolio.finance.dto.profile.UserProfileResponse;

public record AuthResponse(
        String token,
        UserProfileResponse user
) {
}
