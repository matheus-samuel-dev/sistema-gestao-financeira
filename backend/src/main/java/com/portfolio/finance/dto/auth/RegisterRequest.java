package com.portfolio.finance.dto.auth;

import com.portfolio.finance.domain.enums.AccountType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Informe o nome.")
        @Size(min = 3, max = 120, message = "O nome deve ter entre 3 e 120 caracteres.")
        String name,

        @NotBlank(message = "Informe o e-mail.")
        @Email(message = "Informe um e-mail válido.")
        String email,

        @NotBlank(message = "Informe a senha.")
        @Size(min = 6, max = 80, message = "A senha deve ter entre 6 e 80 caracteres.")
        String password,

        @NotNull(message = "Selecione o tipo de conta.")
        AccountType accountType
) {
}
