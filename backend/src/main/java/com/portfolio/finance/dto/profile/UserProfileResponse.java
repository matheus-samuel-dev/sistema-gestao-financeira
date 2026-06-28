package com.portfolio.finance.dto.profile;

import com.portfolio.finance.domain.enums.AccountType;
import com.portfolio.finance.domain.enums.ThemePreference;
import java.time.OffsetDateTime;

public record UserProfileResponse(
        Long id,
        String name,
        String email,
        AccountType accountType,
        ThemePreference themePreference,
        OffsetDateTime createdAt
) {
}
