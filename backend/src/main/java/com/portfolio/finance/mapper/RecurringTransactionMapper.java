package com.portfolio.finance.mapper;

import com.portfolio.finance.domain.entity.RecurringTransaction;
import com.portfolio.finance.dto.recurring.RecurringTransactionResponse;
import org.springframework.stereotype.Component;

@Component
public class RecurringTransactionMapper {

    public RecurringTransactionResponse toResponse(RecurringTransaction recurringTransaction) {
        return new RecurringTransactionResponse(
                recurringTransaction.getId(),
                recurringTransaction.getDescription(),
                recurringTransaction.getAmount(),
                recurringTransaction.getType(),
                recurringTransaction.getPaymentMethod(),
                recurringTransaction.getNote(),
                recurringTransaction.getFrequency(),
                recurringTransaction.getStartDate(),
                recurringTransaction.getEndDate(),
                recurringTransaction.getNextExecution(),
                recurringTransaction.getActive(),
                recurringTransaction.getCategory().getId(),
                recurringTransaction.getCategory().getName()
        );
    }
}
