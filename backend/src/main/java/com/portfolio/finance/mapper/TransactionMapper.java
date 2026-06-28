package com.portfolio.finance.mapper;

import com.portfolio.finance.domain.entity.FinancialTransaction;
import com.portfolio.finance.dto.transaction.TransactionResponse;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public TransactionResponse toResponse(FinancialTransaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getDescription(),
                transaction.getAmount(),
                transaction.getType(),
                transaction.getTransactionDate(),
                transaction.getPaymentMethod(),
                transaction.getNote(),
                transaction.getRecurring(),
                transaction.getStatus(),
                transaction.getCategory().getId(),
                transaction.getCategory().getName(),
                transaction.getCategory().getColor(),
                transaction.getCategory().getIcon(),
                transaction.getRecurringTransaction() != null ? transaction.getRecurringTransaction().getId() : null,
                transaction.getCreatedAt()
        );
    }
}
