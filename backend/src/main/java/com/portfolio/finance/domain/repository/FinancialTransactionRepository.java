package com.portfolio.finance.domain.repository;

import com.portfolio.finance.domain.entity.FinancialTransaction;
import com.portfolio.finance.domain.entity.RecurringTransaction;
import com.portfolio.finance.domain.entity.User;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, Long>,
        JpaSpecificationExecutor<FinancialTransaction> {

    List<FinancialTransaction> findTop8ByUserOrderByTransactionDateDescCreatedAtDesc(User user);

    boolean existsByCategoryId(Long categoryId);

    boolean existsByRecurringTransactionAndTransactionDate(RecurringTransaction recurringTransaction, LocalDate transactionDate);
}
