package com.portfolio.finance.service;

import com.portfolio.finance.domain.entity.Category;
import com.portfolio.finance.domain.entity.FinancialGoal;
import com.portfolio.finance.domain.entity.User;
import com.portfolio.finance.domain.enums.GoalStatus;
import com.portfolio.finance.domain.repository.FinancialGoalRepository;
import com.portfolio.finance.dto.goal.GoalRequest;
import com.portfolio.finance.dto.goal.GoalResponse;
import com.portfolio.finance.exception.NotFoundException;
import com.portfolio.finance.mapper.GoalMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GoalService {

    private final FinancialGoalRepository financialGoalRepository;
    private final CurrentUserService currentUserService;
    private final CategoryService categoryService;
    private final GoalMapper goalMapper;

    public GoalService(
            FinancialGoalRepository financialGoalRepository,
            CurrentUserService currentUserService,
            CategoryService categoryService,
            GoalMapper goalMapper
    ) {
        this.financialGoalRepository = financialGoalRepository;
        this.currentUserService = currentUserService;
        this.categoryService = categoryService;
        this.goalMapper = goalMapper;
    }

    @Transactional
    public List<GoalResponse> list() {
        User user = currentUserService.getCurrentUser();
        return financialGoalRepository.findAllByUserOrderByDeadlineAsc(user).stream()
                .peek(this::refreshStatus)
                .map(goalMapper::toResponse)
                .toList();
    }

    @Transactional
    public GoalResponse create(GoalRequest request) {
        User user = currentUserService.getCurrentUser();
        Category category = resolveCategory(request, user);

        FinancialGoal goal = FinancialGoal.builder()
                .name(request.name().trim())
                .targetAmount(request.targetAmount())
                .currentAmount(request.currentAmount())
                .deadline(request.deadline())
                .description(request.description())
                .status(resolveStatus(request.status(), request.currentAmount(), request.targetAmount(), request.deadline()))
                .category(category)
                .user(user)
                .build();

        return goalMapper.toResponse(financialGoalRepository.save(goal));
    }

    @Transactional
    public GoalResponse update(Long id, GoalRequest request) {
        User user = currentUserService.getCurrentUser();
        FinancialGoal goal = findOwnedGoal(id, user);
        Category category = resolveCategory(request, user);

        goal.setName(request.name().trim());
        goal.setTargetAmount(request.targetAmount());
        goal.setCurrentAmount(request.currentAmount());
        goal.setDeadline(request.deadline());
        goal.setDescription(request.description());
        goal.setStatus(resolveStatus(request.status(), request.currentAmount(), request.targetAmount(), request.deadline()));
        goal.setCategory(category);

        return goalMapper.toResponse(financialGoalRepository.save(goal));
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUserService.getCurrentUser();
        FinancialGoal goal = findOwnedGoal(id, user);
        financialGoalRepository.delete(goal);
    }

    @Transactional
    public List<FinancialGoal> findEntitiesForCurrentUser() {
        User user = currentUserService.getCurrentUser();
        return financialGoalRepository.findAllByUserOrderByDeadlineAsc(user)
                .stream()
                .peek(this::refreshStatus)
                .toList();
    }

    @Transactional(readOnly = true)
    public FinancialGoal findOwnedGoal(Long id, User user) {
        return financialGoalRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new NotFoundException("Meta financeira não encontrada."));
    }

    private Category resolveCategory(GoalRequest request, User user) {
        if (request.categoryId() == null) {
            return null;
        }
        return categoryService.findOwnedCategory(request.categoryId(), user);
    }

    private GoalStatus resolveStatus(
            GoalStatus requestedStatus,
            BigDecimal currentAmount,
            BigDecimal targetAmount,
            LocalDate deadline
    ) {
        if (requestedStatus == GoalStatus.CANCELED) {
            return GoalStatus.CANCELED;
        }

        if (currentAmount.compareTo(targetAmount) >= 0) {
            return GoalStatus.COMPLETED;
        }

        if (deadline.isBefore(LocalDate.now())) {
            return GoalStatus.OVERDUE;
        }

        return GoalStatus.IN_PROGRESS;
    }

    private void refreshStatus(FinancialGoal goal) {
        GoalStatus newStatus = resolveStatus(goal.getStatus(), goal.getCurrentAmount(), goal.getTargetAmount(), goal.getDeadline());
        if (goal.getStatus() != newStatus) {
            goal.setStatus(newStatus);
            financialGoalRepository.save(goal);
        }
    }
}
