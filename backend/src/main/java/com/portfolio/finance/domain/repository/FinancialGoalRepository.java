package com.portfolio.finance.domain.repository;

import com.portfolio.finance.domain.entity.FinancialGoal;
import com.portfolio.finance.domain.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, Long> {

    List<FinancialGoal> findAllByUserOrderByDeadlineAsc(User user);

    Optional<FinancialGoal> findByIdAndUser(Long id, User user);
}
