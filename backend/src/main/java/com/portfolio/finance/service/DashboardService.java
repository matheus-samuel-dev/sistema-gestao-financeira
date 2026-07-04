package com.portfolio.finance.service;

import com.portfolio.finance.domain.entity.FinancialGoal;
import com.portfolio.finance.domain.entity.FinancialTransaction;
import com.portfolio.finance.domain.enums.GoalStatus;
import com.portfolio.finance.domain.enums.TransactionStatus;
import com.portfolio.finance.domain.enums.TransactionType;
import com.portfolio.finance.dto.dashboard.BalanceEvolutionPoint;
import com.portfolio.finance.dto.dashboard.CategoryBreakdownPoint;
import com.portfolio.finance.dto.dashboard.DashboardResponse;
import com.portfolio.finance.dto.dashboard.MonthlyComparisonPoint;
import com.portfolio.finance.dto.dashboard.TypeCountPoint;
import com.portfolio.finance.dto.goal.GoalResponse;
import com.portfolio.finance.dto.transaction.TransactionFilter;
import com.portfolio.finance.dto.transaction.TransactionResponse;
import com.portfolio.finance.mapper.GoalMapper;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private static final Locale LOCALE_PT_BR = Locale.forLanguageTag("pt-BR");
    private static final DateTimeFormatter MONTH_LABEL_FORMATTER = DateTimeFormatter.ofPattern("MMM/yy", LOCALE_PT_BR);

    private final TransactionService transactionService;
    private final GoalService goalService;
    private final GoalMapper goalMapper;

    public DashboardService(TransactionService transactionService, GoalService goalService, GoalMapper goalMapper) {
        this.transactionService = transactionService;
        this.goalService = goalService;
        this.goalMapper = goalMapper;
    }

    @Transactional
    public DashboardResponse getDashboard(
            Integer month,
            Integer year,
            TransactionType type,
            Long categoryId,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal minAmount,
            BigDecimal maxAmount
    ) {
        TransactionFilter baseFilter = TransactionFilter.builder()
                .month(month)
                .year(year)
                .type(type)
                .categoryId(categoryId)
                .startDate(startDate)
                .endDate(endDate)
                .minAmount(minAmount)
                .maxAmount(maxAmount)
                .sortBy("transactionDate")
                .sortDirection("desc")
                .page(0)
                .size(2000)
                .build();

        List<FinancialTransaction> filteredTransactions = transactionService.findEntitiesForCurrentUser(baseFilter);
        List<FinancialTransaction> allTransactions = transactionService.findEntitiesForCurrentUser(
                TransactionFilter.builder().page(0).size(5000).sortBy("transactionDate").sortDirection("asc").build()
        );
        List<FinancialGoal> goals = goalService.findEntitiesForCurrentUser();
        List<GoalResponse> highlightedGoals = goals.stream()
                .filter(goal -> goal.getStatus() == GoalStatus.IN_PROGRESS || goal.getStatus() == GoalStatus.OVERDUE)
                .sorted(Comparator.comparing(FinancialGoal::getDeadline))
                .limit(4)
                .map(goalMapper::toResponse)
                .toList();

        BigDecimal currentBalance = calculateBalance(allTransactions);
        BigDecimal monthlyIncome = sumByType(filteredTransactions, TransactionType.INCOME);
        BigDecimal monthlyExpenses = sumByType(filteredTransactions, TransactionType.EXPENSE);
        BigDecimal monthlySavings = monthlyIncome.subtract(monthlyExpenses);
        BigDecimal spendingPercentage = monthlyIncome.compareTo(BigDecimal.ZERO) > 0
                ? monthlyExpenses.multiply(BigDecimal.valueOf(100)).divide(monthlyIncome, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<CategoryBreakdownPoint> expenseBreakdown = buildCategoryBreakdown(filteredTransactions);
        String topExpenseCategory = expenseBreakdown.isEmpty() ? "Sem dados" : expenseBreakdown.getFirst().name();

        return new DashboardResponse(
                currentBalance,
                monthlyIncome,
                monthlyExpenses,
                monthlySavings,
                spendingPercentage,
                topExpenseCategory,
                highlightedGoals.size(),
                highlightedGoals,
                transactionService.recentTransactions(),
                buildMonthlyComparison(allTransactions, endDate != null ? endDate : LocalDate.now()),
                expenseBreakdown,
                buildBalanceEvolution(allTransactions, endDate != null ? endDate : LocalDate.now()),
                buildTypeCount(filteredTransactions)
        );
    }

    private BigDecimal calculateBalance(List<FinancialTransaction> transactions) {
        BigDecimal income = sumByType(transactions, TransactionType.INCOME);
        BigDecimal expense = sumByType(transactions, TransactionType.EXPENSE);
        return income.subtract(expense);
    }

    private BigDecimal sumByType(List<FinancialTransaction> transactions, TransactionType type) {
        return transactions.stream()
                .filter(transaction -> transaction.getType() == type)
                .filter(transaction -> transaction.getStatus() != TransactionStatus.CANCELED)
                .map(FinancialTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<CategoryBreakdownPoint> buildCategoryBreakdown(List<FinancialTransaction> transactions) {
        Map<Long, CategoryBreakdownAccumulator> breakdownByCategory = new LinkedHashMap<>();

        transactions.stream()
                .filter(transaction -> transaction.getType() == TransactionType.EXPENSE)
                .filter(transaction -> transaction.getStatus() != TransactionStatus.CANCELED)
                .forEach(transaction -> breakdownByCategory.merge(
                        transaction.getCategory().getId(),
                        new CategoryBreakdownAccumulator(
                                transaction.getCategory().getName(),
                                transaction.getCategory().getColor(),
                                transaction.getAmount()
                        ),
                        CategoryBreakdownAccumulator::add
                ));

        return breakdownByCategory.values()
                .stream()
                .map(accumulator -> new CategoryBreakdownPoint(
                        accumulator.name(),
                        accumulator.value(),
                        accumulator.color()
                ))
                .sorted(Comparator.comparing(CategoryBreakdownPoint::value).reversed())
                .toList();
    }

    private List<MonthlyComparisonPoint> buildMonthlyComparison(List<FinancialTransaction> transactions, LocalDate referenceDate) {
        List<MonthlyComparisonPoint> comparison = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth month = YearMonth.from(referenceDate).minusMonths(i);
            BigDecimal income = sumMonth(transactions, month, TransactionType.INCOME);
            BigDecimal expense = sumMonth(transactions, month, TransactionType.EXPENSE);
            comparison.add(new MonthlyComparisonPoint(month.format(MONTH_LABEL_FORMATTER), income, expense));
        }
        return comparison;
    }

    private List<BalanceEvolutionPoint> buildBalanceEvolution(List<FinancialTransaction> transactions, LocalDate referenceDate) {
        List<BalanceEvolutionPoint> evolution = new ArrayList<>();
        BigDecimal runningBalance = BigDecimal.ZERO;
        for (int i = 5; i >= 0; i--) {
            YearMonth month = YearMonth.from(referenceDate).minusMonths(i);
            BigDecimal monthIncome = sumMonth(transactions, month, TransactionType.INCOME);
            BigDecimal monthExpense = sumMonth(transactions, month, TransactionType.EXPENSE);
            runningBalance = runningBalance.add(monthIncome).subtract(monthExpense);
            evolution.add(new BalanceEvolutionPoint(month.format(MONTH_LABEL_FORMATTER), runningBalance));
        }
        return evolution;
    }

    private List<TypeCountPoint> buildTypeCount(List<FinancialTransaction> transactions) {
        Map<TransactionType, Long> counts = transactions.stream()
                .filter(transaction -> transaction.getStatus() != TransactionStatus.CANCELED)
                .collect(Collectors.groupingBy(FinancialTransaction::getType, Collectors.counting()));

        return List.of(
                new TypeCountPoint("Receitas", counts.getOrDefault(TransactionType.INCOME, 0L)),
                new TypeCountPoint("Despesas", counts.getOrDefault(TransactionType.EXPENSE, 0L))
        );
    }

    private BigDecimal sumMonth(List<FinancialTransaction> transactions, YearMonth month, TransactionType type) {
        return transactions.stream()
                .filter(transaction -> transaction.getType() == type)
                .filter(transaction -> YearMonth.from(transaction.getTransactionDate()).equals(month))
                .filter(transaction -> transaction.getStatus() != TransactionStatus.CANCELED)
                .map(FinancialTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private record CategoryBreakdownAccumulator(String name, String color, BigDecimal value) {

        private CategoryBreakdownAccumulator add(CategoryBreakdownAccumulator other) {
            return new CategoryBreakdownAccumulator(name, color, value.add(other.value));
        }
    }
}
