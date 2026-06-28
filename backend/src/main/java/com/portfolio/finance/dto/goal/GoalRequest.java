package com.portfolio.finance.dto.goal;

import com.portfolio.finance.domain.enums.GoalStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record GoalRequest(
        @NotBlank(message = "Informe o nome da meta.")
        @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.")
        String name,

        @NotNull(message = "Informe o valor alvo.")
        @DecimalMin(value = "0.01", message = "O valor alvo deve ser maior que zero.")
        BigDecimal targetAmount,

        @NotNull(message = "Informe o valor atual.")
        @DecimalMin(value = "0.00", message = "O valor atual não pode ser negativo.")
        BigDecimal currentAmount,

        @NotNull(message = "Informe o prazo da meta.")
        LocalDate deadline,

        @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres.")
        String description,

        GoalStatus status,

        Long categoryId
) {
}
