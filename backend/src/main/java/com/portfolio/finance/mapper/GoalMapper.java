package com.portfolio.finance.mapper;

import com.portfolio.finance.domain.entity.FinancialGoal;
import com.portfolio.finance.dto.goal.GoalResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.stereotype.Component;

@Component
public class GoalMapper {

    public GoalResponse toResponse(FinancialGoal goal) {
        BigDecimal progress = BigDecimal.ZERO;
        if (goal.getTargetAmount() != null && goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            progress = goal.getCurrentAmount()
                    .multiply(BigDecimal.valueOf(100))
                    .divide(goal.getTargetAmount(), 2, RoundingMode.HALF_UP);
        }

        return new GoalResponse(
                goal.getId(),
                goal.getName(),
                goal.getTargetAmount(),
                goal.getCurrentAmount(),
                goal.getDeadline(),
                goal.getDescription(),
                goal.getStatus(),
                progress.min(BigDecimal.valueOf(100)),
                goal.getCategory() != null ? goal.getCategory().getId() : null,
                goal.getCategory() != null ? goal.getCategory().getName() : null
        );
    }
}
