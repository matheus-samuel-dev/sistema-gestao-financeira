package com.portfolio.finance.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

import com.portfolio.finance.domain.entity.Category;
import com.portfolio.finance.domain.entity.FinancialTransaction;
import com.portfolio.finance.domain.entity.User;
import com.portfolio.finance.domain.enums.AccountType;
import com.portfolio.finance.domain.enums.TransactionStatus;
import com.portfolio.finance.domain.enums.TransactionType;
import com.portfolio.finance.domain.repository.FinancialTransactionRepository;
import com.portfolio.finance.dto.transaction.TransactionRequest;
import com.portfolio.finance.dto.transaction.TransactionResponse;
import com.portfolio.finance.exception.NotFoundException;
import com.portfolio.finance.mapper.TransactionMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private FinancialTransactionRepository financialTransactionRepository;
    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private CategoryService categoryService;
    @Mock
    private RecurringTransactionService recurringTransactionService;

    private TransactionService transactionService;
    private User user;
    private Category category;

    @BeforeEach
    void setUp() {
        transactionService = new TransactionService(
                financialTransactionRepository,
                currentUserService,
                categoryService,
                recurringTransactionService,
                new TransactionMapper()
        );
        user = User.builder()
                .id(1L)
                .name("Demo")
                .email("demo@financeiro.com")
                .password("encoded")
                .accountType(AccountType.BUSINESS)
                .build();
        category = Category.builder()
                .id(2L)
                .name("Vendas")
                .type(TransactionType.INCOME)
                .color("#10B981")
                .icon("shopping_bag")
                .active(true)
                .user(user)
                .build();
    }

    @Test
    void createIncomeTransactionPersistsConfirmedEntryForCurrentUser() {
        TransactionRequest request = new TransactionRequest(
                "Venda de consultoria",
                new BigDecimal("2500.00"),
                TransactionType.INCOME,
                LocalDate.of(2026, 6, 20),
                "PIX",
                "Cliente premium",
                2L,
                false,
                TransactionStatus.CONFIRMED,
                null,
                null,
                null
        );

        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(categoryService.findActiveOwnedCategory(2L, TransactionType.INCOME, user)).thenReturn(category);
        when(financialTransactionRepository.save(any(FinancialTransaction.class))).thenAnswer(invocation -> {
            FinancialTransaction transaction = invocation.getArgument(0);
            transaction.setId(50L);
            return transaction;
        });

        TransactionResponse response = transactionService.create(request);

        ArgumentCaptor<FinancialTransaction> captor = ArgumentCaptor.forClass(FinancialTransaction.class);
        verify(financialTransactionRepository).save(captor.capture());
        assertThat(captor.getValue().getUser()).isEqualTo(user);
        assertThat(captor.getValue().getCategory()).isEqualTo(category);
        assertThat(captor.getValue().getStatus()).isEqualTo(TransactionStatus.CONFIRMED);
        assertThat(response.id()).isEqualTo(50L);
        assertThat(response.amount()).isEqualByComparingTo("2500.00");
    }

    @Test
    void createDefaultsStatusToConfirmedAndTrimsTextFields() {
        TransactionRequest request = new TransactionRequest(
                "  Venda avulsa  ",
                new BigDecimal("300.00"),
                TransactionType.INCOME,
                LocalDate.of(2026, 7, 1),
                "  Cartão  ",
                null,
                2L,
                false,
                null,
                null,
                null,
                null
        );

        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(categoryService.findActiveOwnedCategory(2L, TransactionType.INCOME, user)).thenReturn(category);
        when(financialTransactionRepository.save(any(FinancialTransaction.class))).thenAnswer(invocation -> {
            FinancialTransaction transaction = invocation.getArgument(0);
            transaction.setId(51L);
            return transaction;
        });

        transactionService.create(request);

        ArgumentCaptor<FinancialTransaction> captor = ArgumentCaptor.forClass(FinancialTransaction.class);
        verify(financialTransactionRepository).save(captor.capture());
        assertThat(captor.getValue().getDescription()).isEqualTo("Venda avulsa");
        assertThat(captor.getValue().getPaymentMethod()).isEqualTo("Cartão");
        assertThat(captor.getValue().getStatus()).isEqualTo(TransactionStatus.CONFIRMED);
    }

    @Test
    void deleteDoesNotRemoveTransactionThatDoesNotBelongToCurrentUser() {
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(financialTransactionRepository.findOne(org.mockito.ArgumentMatchers.<Specification<FinancialTransaction>>any()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.delete(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Transação não encontrada");

        verify(financialTransactionRepository, never()).delete(any(FinancialTransaction.class));
    }
}
