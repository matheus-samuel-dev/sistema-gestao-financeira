package com.portfolio.finance.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.portfolio.finance.domain.entity.Category;
import com.portfolio.finance.domain.entity.FinancialTransaction;
import com.portfolio.finance.domain.entity.User;
import com.portfolio.finance.domain.enums.AccountType;
import com.portfolio.finance.domain.enums.TransactionStatus;
import com.portfolio.finance.domain.enums.TransactionType;
import com.portfolio.finance.dto.dashboard.DashboardResponse;
import com.portfolio.finance.mapper.GoalMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private TransactionService transactionService;
    @Mock
    private GoalService goalService;

    private DashboardService dashboardService;
    private User user;
    private Category incomeCategory;
    private Category expenseCategory;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardService(transactionService, goalService, new GoalMapper());
        user = User.builder()
                .id(1L)
                .name("Demo")
                .email("demo@financeiro.com")
                .password("encoded")
                .accountType(AccountType.BUSINESS)
                .build();
        incomeCategory = Category.builder()
                .id(1L)
                .name("Vendas")
                .type(TransactionType.INCOME)
                .color("#10B981")
                .icon("shopping_bag")
                .active(true)
                .user(user)
                .build();
        expenseCategory = Category.builder()
                .id(2L)
                .name("Tecnologia")
                .type(TransactionType.EXPENSE)
                .color("#06B6D4")
                .icon("devices")
                .active(true)
                .user(user)
                .build();
    }

    @Test
    void dashboardCalculatesBalanceSavingsAndSpendingPercentage() {
        List<FinancialTransaction> transactions = List.of(
                transaction("Venda mensal", new BigDecimal("10000.00"), TransactionType.INCOME, incomeCategory),
                transaction("Cloud", new BigDecimal("2500.00"), TransactionType.EXPENSE, expenseCategory)
        );

        when(transactionService.findEntitiesForCurrentUser(any())).thenReturn(transactions);
        when(goalService.findEntitiesForCurrentUser()).thenReturn(List.of());
        when(transactionService.recentTransactions()).thenReturn(List.of());

        DashboardResponse response = dashboardService.getDashboard(6, 2026, null, null, null, null, null, null);

        assertThat(response.currentBalance()).isEqualByComparingTo("7500.00");
        assertThat(response.monthlyIncome()).isEqualByComparingTo("10000.00");
        assertThat(response.monthlyExpenses()).isEqualByComparingTo("2500.00");
        assertThat(response.monthlySavings()).isEqualByComparingTo("7500.00");
        assertThat(response.spendingPercentage()).isEqualByComparingTo("25.00");
        assertThat(response.topExpenseCategory()).isEqualTo("Tecnologia");
    }

    @Test
    void dashboardIgnoresCanceledTransactionsInFinancialIndicators() {
        List<FinancialTransaction> transactions = List.of(
                transaction("Venda confirmada", new BigDecimal("1000.00"), TransactionType.INCOME, incomeCategory),
                transaction("Despesa confirmada", new BigDecimal("250.00"), TransactionType.EXPENSE, expenseCategory),
                transaction("Despesa cancelada", new BigDecimal("900.00"), TransactionType.EXPENSE, expenseCategory, TransactionStatus.CANCELED)
        );

        when(transactionService.findEntitiesForCurrentUser(any())).thenReturn(transactions);
        when(goalService.findEntitiesForCurrentUser()).thenReturn(List.of());
        when(transactionService.recentTransactions()).thenReturn(List.of());

        DashboardResponse response = dashboardService.getDashboard(6, 2026, null, null, null, null, null, null);

        assertThat(response.monthlyIncome()).isEqualByComparingTo("1000.00");
        assertThat(response.monthlyExpenses()).isEqualByComparingTo("250.00");
        assertThat(response.currentBalance()).isEqualByComparingTo("750.00");
        assertThat(response.expensesByCategory()).singleElement()
                .satisfies(point -> assertThat(point.value()).isEqualByComparingTo("250.00"));
    }

    private FinancialTransaction transaction(String description, BigDecimal amount, TransactionType type, Category category) {
        return transaction(description, amount, type, category, TransactionStatus.CONFIRMED);
    }

    private FinancialTransaction transaction(
            String description,
            BigDecimal amount,
            TransactionType type,
            Category category,
            TransactionStatus status
    ) {
        return FinancialTransaction.builder()
                .id((long) description.hashCode())
                .description(description)
                .amount(amount)
                .type(type)
                .transactionDate(LocalDate.of(2026, 6, 10))
                .paymentMethod("PIX")
                .status(status)
                .recurring(false)
                .category(category)
                .user(user)
                .build();
    }
}
