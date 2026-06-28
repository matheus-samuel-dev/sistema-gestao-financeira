package com.portfolio.finance.domain.repository;

import com.portfolio.finance.domain.entity.RecurringTransaction;
import com.portfolio.finance.domain.entity.User;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {

    List<RecurringTransaction> findAllByUserOrderByNextExecutionAsc(User user);

    List<RecurringTransaction> findAllByUserAndActiveTrueAndNextExecutionLessThanEqualOrderByNextExecutionAsc(
            User user,
            LocalDate referenceDate
    );

    Optional<RecurringTransaction> findByIdAndUser(Long id, User user);
}
