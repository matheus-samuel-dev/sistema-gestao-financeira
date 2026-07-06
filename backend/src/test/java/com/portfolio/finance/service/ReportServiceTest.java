package com.portfolio.finance.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.portfolio.finance.domain.entity.Category;
import com.portfolio.finance.domain.entity.FinancialTransaction;
import com.portfolio.finance.domain.entity.User;
import com.portfolio.finance.domain.enums.AccountType;
import com.portfolio.finance.domain.enums.TransactionStatus;
import com.portfolio.finance.domain.enums.TransactionType;
import com.portfolio.finance.dto.report.ReportResponse;
import com.portfolio.finance.dto.transaction.TransactionFilter;
import com.portfolio.finance.mapper.TransactionMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private TransactionService transactionService;

    private ReportService reportService;
    private User user;
    private Category incomeCategory;
    private Category expenseCategory;

    @BeforeEach
    void setUp() {
        reportService = new ReportService(transactionService, new TransactionMapper());
        user = User.builder()
                .id(1L)
                .name("Demo")
                .email("demo@financeiro.com")
                .password("encoded")
                .accountType(AccountType.BUSINESS)
                .build();
        incomeCategory = category(1L, "Consultoria", TransactionType.INCOME, "#10B981");
        expenseCategory = category(2L, "Infraestrutura", TransactionType.EXPENSE, "#F59E0B");
    }

    @Test
    void generatePassesAmountRangeToTransactionFilter() {
        ArgumentCaptor<TransactionFilter> filterCaptor = ArgumentCaptor.forClass(TransactionFilter.class);
        when(transactionService.findEntitiesForCurrentUser(filterCaptor.capture())).thenReturn(List.of());

        reportService.generate(
                6,
                2026,
                TransactionType.EXPENSE,
                2L,
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 6, 30),
                new BigDecimal("100.00"),
                new BigDecimal("500.00")
        );

        TransactionFilter filter = filterCaptor.getValue();
        assertThat(filter.getType()).isEqualTo(TransactionType.EXPENSE);
        assertThat(filter.getCategoryId()).isEqualTo(2L);
        assertThat(filter.getMinAmount()).isEqualByComparingTo("100.00");
        assertThat(filter.getMaxAmount()).isEqualByComparingTo("500.00");
    }

    @Test
    void generateIgnoresCanceledTransactionsInFinancialTotalsAndRanking() {
        when(transactionService.findEntitiesForCurrentUser(org.mockito.ArgumentMatchers.any())).thenReturn(List.of(
                transaction("Receita confirmada", new BigDecimal("1000.00"), TransactionType.INCOME, incomeCategory, TransactionStatus.CONFIRMED),
                transaction("Despesa confirmada", new BigDecimal("250.00"), TransactionType.EXPENSE, expenseCategory, TransactionStatus.CONFIRMED),
                transaction("Despesa cancelada", new BigDecimal("900.00"), TransactionType.EXPENSE, expenseCategory, TransactionStatus.CANCELED)
        ));

        ReportResponse response = reportService.generate(6, 2026, null, null, null, null, null, null);

        assertThat(response.totalIncome()).isEqualByComparingTo("1000.00");
        assertThat(response.totalExpense()).isEqualByComparingTo("250.00");
        assertThat(response.netBalance()).isEqualByComparingTo("750.00");
        assertThat(response.expenseByCategory()).singleElement()
                .satisfies(category -> assertThat(category.total()).isEqualByComparingTo("250.00"));
        assertThat(response.topExpenses()).singleElement()
                .satisfies(transaction -> assertThat(transaction.description()).isEqualTo("Despesa confirmada"));
    }

    private Category category(Long id, String name, TransactionType type, String color) {
        return Category.builder()
                .id(id)
                .name(name)
                .type(type)
                .color(color)
                .icon("paid")
                .active(true)
                .user(user)
                .build();
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
