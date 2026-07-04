package com.portfolio.finance.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.portfolio.finance.domain.entity.FinancialGoal;
import com.portfolio.finance.domain.entity.User;
import com.portfolio.finance.domain.enums.AccountType;
import com.portfolio.finance.domain.enums.GoalStatus;
import com.portfolio.finance.domain.repository.FinancialGoalRepository;
import com.portfolio.finance.dto.goal.GoalRequest;
import com.portfolio.finance.dto.goal.GoalResponse;
import com.portfolio.finance.exception.NotFoundException;
import com.portfolio.finance.mapper.GoalMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GoalServiceTest {

    @Mock
    private FinancialGoalRepository financialGoalRepository;
    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private CategoryService categoryService;

    private GoalService goalService;
    private User user;

    @BeforeEach
    void setUp() {
        goalService = new GoalService(financialGoalRepository, currentUserService, categoryService, new GoalMapper());
        user = User.builder()
                .id(1L)
                .name("Demo")
                .email("demo@financeiro.com")
                .password("encoded")
                .accountType(AccountType.BUSINESS)
                .build();
    }

    @Test
    void createMarksGoalAsCompletedWhenCurrentAmountReachesTarget() {
        GoalRequest request = new GoalRequest(
                "Reserva",
                new BigDecimal("1000.00"),
                new BigDecimal("1000.00"),
                LocalDate.now().plusDays(30),
                null,
                GoalStatus.IN_PROGRESS,
                null
        );

        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(financialGoalRepository.save(any(FinancialGoal.class))).thenAnswer(invocation -> {
            FinancialGoal goal = invocation.getArgument(0);
            goal.setId(10L);
            return goal;
        });

        GoalResponse response = goalService.create(request);

        assertThat(response.status()).isEqualTo(GoalStatus.COMPLETED);
    }

    @Test
    void createPreservesCanceledStatus() {
        GoalRequest request = new GoalRequest(
                "Projeto pausado",
                new BigDecimal("5000.00"),
                new BigDecimal("100.00"),
                LocalDate.now().plusDays(30),
                null,
                GoalStatus.CANCELED,
                null
        );

        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(financialGoalRepository.save(any(FinancialGoal.class))).thenAnswer(invocation -> {
            FinancialGoal goal = invocation.getArgument(0);
            goal.setId(11L);
            return goal;
        });

        GoalResponse response = goalService.create(request);

        assertThat(response.status()).isEqualTo(GoalStatus.CANCELED);
    }

    @Test
    void listRefreshesOverdueGoals() {
        FinancialGoal goal = FinancialGoal.builder()
                .id(12L)
                .name("Meta vencida")
                .targetAmount(new BigDecimal("1000.00"))
                .currentAmount(new BigDecimal("100.00"))
                .deadline(LocalDate.now().minusDays(1))
                .status(GoalStatus.IN_PROGRESS)
                .user(user)
                .build();

        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(financialGoalRepository.findAllByUserOrderByDeadlineAsc(user)).thenReturn(List.of(goal));

        List<GoalResponse> response = goalService.list();

        assertThat(response).singleElement().satisfies(item -> assertThat(item.status()).isEqualTo(GoalStatus.OVERDUE));
        ArgumentCaptor<FinancialGoal> captor = ArgumentCaptor.forClass(FinancialGoal.class);
        verify(financialGoalRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(GoalStatus.OVERDUE);
    }

    @Test
    void findOwnedGoalRejectsGoalFromAnotherUser() {
        when(financialGoalRepository.findByIdAndUser(99L, user)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> goalService.findOwnedGoal(99L, user))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Meta financeira não encontrada");
    }
}
