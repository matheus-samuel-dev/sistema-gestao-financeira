package com.portfolio.finance.dto.report;

import com.portfolio.finance.dto.transaction.TransactionResponse;
import java.math.BigDecimal;
import java.util.List;

public record ReportResponse(
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal netBalance,
        List<ReportCategorySummary> incomeByCategory,
        List<ReportCategorySummary> expenseByCategory,
        List<TransactionResponse> topExpenses,
        List<ReportMonthlySummary> monthlyEvolution,
        List<ReportMonthlySummary> monthlyComparison
) {
}
