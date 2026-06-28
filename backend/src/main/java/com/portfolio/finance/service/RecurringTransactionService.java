package com.portfolio.finance.service;

import com.portfolio.finance.domain.entity.Category;
import com.portfolio.finance.domain.entity.FinancialTransaction;
import com.portfolio.finance.domain.entity.RecurringTransaction;
import com.portfolio.finance.domain.entity.User;
import com.portfolio.finance.domain.enums.RecurringFrequency;
import com.portfolio.finance.domain.enums.TransactionStatus;
import com.portfolio.finance.domain.repository.FinancialTransactionRepository;
import com.portfolio.finance.domain.repository.RecurringTransactionRepository;
import com.portfolio.finance.dto.recurring.RecurringTransactionRequest;
import com.portfolio.finance.dto.recurring.RecurringTransactionResponse;
import com.portfolio.finance.dto.transaction.TransactionRequest;
import com.portfolio.finance.exception.BusinessRuleException;
import com.portfolio.finance.exception.NotFoundException;
import com.portfolio.finance.mapper.RecurringTransactionMapper;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final FinancialTransactionRepository financialTransactionRepository;
    private final CurrentUserService currentUserService;
    private final CategoryService categoryService;
    private final RecurringTransactionMapper recurringTransactionMapper;

    public RecurringTransactionService(
            RecurringTransactionRepository recurringTransactionRepository,
            FinancialTransactionRepository financialTransactionRepository,
            CurrentUserService currentUserService,
            CategoryService categoryService,
            RecurringTransactionMapper recurringTransactionMapper
    ) {
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.financialTransactionRepository = financialTransactionRepository;
        this.currentUserService = currentUserService;
        this.categoryService = categoryService;
        this.recurringTransactionMapper = recurringTransactionMapper;
    }

    @Transactional
    public List<RecurringTransactionResponse> list() {
        User user = currentUserService.getCurrentUser();
        syncDueTransactions(user, LocalDate.now());
        return recurringTransactionRepository.findAllByUserOrderByNextExecutionAsc(user)
                .stream()
                .map(recurringTransactionMapper::toResponse)
                .toList();
    }

    @Transactional
    public RecurringTransactionResponse create(RecurringTransactionRequest request) {
        User user = currentUserService.getCurrentUser();
        Category category = categoryService.findActiveOwnedCategory(request.categoryId(), request.type(), user);
        validateDates(request.startDate(), request.endDate());

        RecurringTransaction recurringTransaction = RecurringTransaction.builder()
                .description(request.description().trim())
                .amount(request.amount())
                .type(request.type())
                .paymentMethod(request.paymentMethod().trim())
                .note(request.note())
                .frequency(request.frequency())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .nextExecution(request.nextExecution() != null ? request.nextExecution() : request.startDate())
                .active(request.active() == null || request.active())
                .category(category)
                .user(user)
                .build();

        return recurringTransactionMapper.toResponse(recurringTransactionRepository.save(recurringTransaction));
    }

    @Transactional
    public RecurringTransactionResponse update(Long id, RecurringTransactionRequest request) {
        User user = currentUserService.getCurrentUser();
        RecurringTransaction recurringTransaction = findOwnedRecurring(id, user);
        Category category = categoryService.findActiveOwnedCategory(request.categoryId(), request.type(), user);
        validateDates(request.startDate(), request.endDate());

        recurringTransaction.setDescription(request.description().trim());
        recurringTransaction.setAmount(request.amount());
        recurringTransaction.setType(request.type());
        recurringTransaction.setPaymentMethod(request.paymentMethod().trim());
        recurringTransaction.setNote(request.note());
        recurringTransaction.setFrequency(request.frequency());
        recurringTransaction.setStartDate(request.startDate());
        recurringTransaction.setEndDate(request.endDate());
        recurringTransaction.setNextExecution(request.nextExecution() != null ? request.nextExecution() : request.startDate());
        recurringTransaction.setActive(request.active() == null || request.active());
        recurringTransaction.setCategory(category);

        return recurringTransactionMapper.toResponse(recurringTransactionRepository.save(recurringTransaction));
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUserService.getCurrentUser();
        RecurringTransaction recurringTransaction = findOwnedRecurring(id, user);
        recurringTransaction.setActive(false);
        recurringTransactionRepository.save(recurringTransaction);
    }

    @Transactional
    public void syncDueTransactions(User user, LocalDate referenceDate) {
        List<RecurringTransaction> dueRecurring = recurringTransactionRepository
                .findAllByUserAndActiveTrueAndNextExecutionLessThanEqualOrderByNextExecutionAsc(user, referenceDate);

        for (RecurringTransaction recurring : dueRecurring) {
            generateTransactionsUntil(recurring, referenceDate);
        }
    }

    @Transactional
    public RecurringTransaction createOrUpdateFromTransaction(
            User user,
            Category category,
            TransactionRequest request,
            FinancialTransaction transaction
    ) {
        if (!Boolean.TRUE.equals(request.recurring())) {
            if (transaction.getRecurringTransaction() != null) {
                deactivate(transaction.getRecurringTransaction());
                transaction.setRecurringTransaction(null);
            }
            return null;
        }

        if (request.recurringFrequency() == null) {
            throw new BusinessRuleException("Selecione a frequência da recorrência.");
        }

        LocalDate startDate = request.recurringStartDate() != null ? request.recurringStartDate() : request.transactionDate();
        validateDates(startDate, request.recurringEndDate());

        RecurringTransaction recurringTransaction = transaction.getRecurringTransaction() != null
                ? transaction.getRecurringTransaction()
                : new RecurringTransaction();

        recurringTransaction.setDescription(request.description().trim());
        recurringTransaction.setAmount(request.amount());
        recurringTransaction.setType(request.type());
        recurringTransaction.setPaymentMethod(request.paymentMethod().trim());
        recurringTransaction.setNote(request.note());
        recurringTransaction.setFrequency(request.recurringFrequency());
        recurringTransaction.setStartDate(startDate);
        recurringTransaction.setEndDate(request.recurringEndDate());
        recurringTransaction.setNextExecution(startDate);
        recurringTransaction.setActive(true);
        recurringTransaction.setCategory(category);
        recurringTransaction.setUser(user);

        return recurringTransactionRepository.save(recurringTransaction);
    }

    @Transactional(readOnly = true)
    public RecurringTransaction findOwnedRecurring(Long id, User user) {
        return recurringTransactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new NotFoundException("Transação recorrente não encontrada."));
    }

    @Transactional
    public void deactivate(RecurringTransaction recurringTransaction) {
        recurringTransaction.setActive(false);
        recurringTransactionRepository.save(recurringTransaction);
    }

    private void generateTransactionsUntil(RecurringTransaction recurring, LocalDate referenceDate) {
        LocalDate executionDate = recurring.getNextExecution();

        while (Boolean.TRUE.equals(recurring.getActive()) && executionDate != null && !executionDate.isAfter(referenceDate)) {
            if (recurring.getEndDate() != null && executionDate.isAfter(recurring.getEndDate())) {
                recurring.setActive(false);
                break;
            }

            if (!financialTransactionRepository.existsByRecurringTransactionAndTransactionDate(recurring, executionDate)) {
                FinancialTransaction transaction = FinancialTransaction.builder()
                        .description(recurring.getDescription())
                        .amount(recurring.getAmount())
                        .type(recurring.getType())
                        .transactionDate(executionDate)
                        .paymentMethod(recurring.getPaymentMethod())
                        .note(recurring.getNote())
                        .recurring(true)
                        .status(TransactionStatus.CONFIRMED)
                        .category(recurring.getCategory())
                        .user(recurring.getUser())
                        .recurringTransaction(recurring)
                        .build();
                financialTransactionRepository.save(transaction);
            }

            executionDate = advanceDate(executionDate, recurring.getFrequency());
            recurring.setNextExecution(executionDate);
            if (recurring.getEndDate() != null && executionDate.isAfter(recurring.getEndDate())) {
                recurring.setActive(false);
            }
        }

        recurringTransactionRepository.save(recurring);
    }

    private LocalDate advanceDate(LocalDate date, RecurringFrequency frequency) {
        return switch (frequency) {
            case WEEKLY -> date.plusWeeks(1);
            case MONTHLY -> date.plusMonths(1);
            case YEARLY -> date.plusYears(1);
        };
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (endDate != null && endDate.isBefore(startDate)) {
            throw new BusinessRuleException("A data final da recorrência não pode ser anterior à data inicial.");
        }
    }
}
