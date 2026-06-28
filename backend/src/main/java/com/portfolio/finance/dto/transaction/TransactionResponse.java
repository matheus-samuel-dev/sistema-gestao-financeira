package com.portfolio.finance.dto.transaction;

import com.portfolio.finance.domain.enums.TransactionStatus;
import com.portfolio.finance.domain.enums.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TransactionResponse(
        Long id,
        String description,
        BigDecimal amount,
        TransactionType type,
        LocalDate transactionDate,
        String paymentMethod,
        String note,
        Boolean recurring,
        TransactionStatus status,
        Long categoryId,
        String categoryName,
        String categoryColor,
        String categoryIcon,
        Long recurringTransactionId,
        LocalDateTime createdAt
) {
}
