package com.portfolio.finance.dto.dashboard;

import com.portfolio.finance.dto.goal.GoalResponse;
import com.portfolio.finance.dto.transaction.TransactionResponse;
import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        BigDecimal currentBalance,
        BigDecimal monthlyIncome,
        BigDecimal monthlyExpenses,
        BigDecimal monthlySavings,
        BigDecimal spendingPercentage,
        String topExpenseCategory,
        long activeGoals,
        List<GoalResponse> highlightedGoals,
        List<TransactionResponse> latestTransactions,
        List<MonthlyComparisonPoint> monthlyComparison,
        List<CategoryBreakdownPoint> expensesByCategory,
        List<BalanceEvolutionPoint> balanceEvolution,
        List<TypeCountPoint> transactionsByType
) {
}
