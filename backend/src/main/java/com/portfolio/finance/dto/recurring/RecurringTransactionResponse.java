package com.portfolio.finance.dto.recurring;

import com.portfolio.finance.domain.enums.RecurringFrequency;
import com.portfolio.finance.domain.enums.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;

public record RecurringTransactionResponse(
        Long id,
        String description,
        BigDecimal amount,
        TransactionType type,
        String paymentMethod,
        String note,
        RecurringFrequency frequency,
        LocalDate startDate,
        LocalDate endDate,
        LocalDate nextExecution,
        Boolean active,
        Long categoryId,
        String categoryName
) {
}
