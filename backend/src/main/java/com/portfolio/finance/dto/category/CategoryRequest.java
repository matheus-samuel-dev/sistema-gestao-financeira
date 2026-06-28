package com.portfolio.finance.dto.category;

import com.portfolio.finance.domain.enums.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "Informe o nome da categoria.")
        @Size(max = 80, message = "O nome deve ter no máximo 80 caracteres.")
        String name,

        @NotNull(message = "Selecione o tipo da categoria.")
        TransactionType type,

        @NotBlank(message = "Informe uma cor.")
        @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "Informe uma cor hexadecimal válida.")
        String color,

        @NotBlank(message = "Informe um ícone.")
        @Size(max = 40, message = "O ícone deve ter no máximo 40 caracteres.")
        String icon,

        Boolean active
) {
}
