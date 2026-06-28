package com.portfolio.finance.dto.goal;

import com.portfolio.finance.domain.enums.GoalStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public record GoalResponse(
        Long id,
        String name,
        BigDecimal targetAmount,
        BigDecimal currentAmount,
        LocalDate deadline,
        String description,
        GoalStatus status,
        BigDecimal progressPercentage,
        Long categoryId,
        String categoryName
) {
}
