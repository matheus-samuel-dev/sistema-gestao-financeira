package com.portfolio.finance.dto.profile;

import com.portfolio.finance.domain.enums.AccountType;
import com.portfolio.finance.domain.enums.ThemePreference;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Informe o nome.")
        @Size(min = 3, max = 120, message = "O nome deve ter entre 3 e 120 caracteres.")
        String name,

        @NotNull(message = "Selecione o tipo de conta.")
        AccountType accountType,

        @NotNull(message = "Selecione o tema.")
        ThemePreference themePreference
) {
}
