package com.portfolio.finance.dto.recurring;

import com.portfolio.finance.domain.enums.RecurringFrequency;
import com.portfolio.finance.domain.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record RecurringTransactionRequest(
        @NotBlank(message = "Informe a descrição.")
        @Size(max = 140, message = "A descrição deve ter no máximo 140 caracteres.")
        String description,

        @NotNull(message = "Informe o valor.")
        @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero.")
        BigDecimal amount,

        @NotNull(message = "Selecione o tipo.")
        TransactionType type,

        @NotBlank(message = "Informe a forma de pagamento ou recebimento.")
        @Size(max = 50, message = "A forma deve ter no máximo 50 caracteres.")
        String paymentMethod,

        @Size(max = 500, message = "A observação deve ter no máximo 500 caracteres.")
        String note,

        @NotNull(message = "Selecione a frequência.")
        RecurringFrequency frequency,

        @NotNull(message = "Informe a data inicial.")
        LocalDate startDate,

        LocalDate endDate,

        LocalDate nextExecution,

        @NotNull(message = "Selecione a categoria.")
        Long categoryId,

        Boolean active
) {
}
