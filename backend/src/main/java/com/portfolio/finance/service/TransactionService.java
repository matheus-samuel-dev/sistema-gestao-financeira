package com.portfolio.finance.service;

import com.portfolio.finance.domain.entity.Category;
import com.portfolio.finance.domain.entity.FinancialTransaction;
import com.portfolio.finance.domain.entity.RecurringTransaction;
import com.portfolio.finance.domain.entity.User;
import com.portfolio.finance.domain.repository.FinancialTransactionRepository;
import com.portfolio.finance.dto.common.PageResponse;
import com.portfolio.finance.dto.transaction.TransactionFilter;
import com.portfolio.finance.dto.transaction.TransactionRequest;
import com.portfolio.finance.dto.transaction.TransactionResponse;
import com.portfolio.finance.exception.NotFoundException;
import com.portfolio.finance.mapper.TransactionMapper;
import jakarta.persistence.criteria.Join;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransactionService {

    private final FinancialTransactionRepository financialTransactionRepository;
    private final CurrentUserService currentUserService;
    private final CategoryService categoryService;
    private final RecurringTransactionService recurringTransactionService;
    private final TransactionMapper transactionMapper;

    public TransactionService(
            FinancialTransactionRepository financialTransactionRepository,
            CurrentUserService currentUserService,
            CategoryService categoryService,
            RecurringTransactionService recurringTransactionService,
            TransactionMapper transactionMapper
    ) {
        this.financialTransactionRepository = financialTransactionRepository;
        this.currentUserService = currentUserService;
        this.categoryService = categoryService;
        this.recurringTransactionService = recurringTransactionService;
        this.transactionMapper = transactionMapper;
    }

    @Transactional
    public PageResponse<TransactionResponse> list(TransactionFilter filter) {
        User user = currentUserService.getCurrentUser();
        recurringTransactionService.syncDueTransactions(user, LocalDate.now());

        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), resolveSort(filter));
        Page<FinancialTransaction> page = financialTransactionRepository.findAll(buildSpecification(user, filter), pageable);

        return new PageResponse<>(
                page.getContent().stream().map(transactionMapper::toResponse).toList(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize()
        );
    }

    @Transactional
    public List<TransactionResponse> recentTransactions() {
        User user = currentUserService.getCurrentUser();
        recurringTransactionService.syncDueTransactions(user, LocalDate.now());
        return financialTransactionRepository.findTop8ByUserOrderByTransactionDateDescCreatedAtDesc(user)
                .stream()
                .map(transactionMapper::toResponse)
                .toList();
    }

    @Transactional
    public List<FinancialTransaction> findEntitiesForCurrentUser(TransactionFilter filter) {
        User user = currentUserService.getCurrentUser();
        recurringTransactionService.syncDueTransactions(user, LocalDate.now());
        Sort sort = resolveSort(filter);
        return financialTransactionRepository.findAll(buildSpecification(user, filter), sort);
    }

    @Transactional
    public TransactionResponse create(TransactionRequest request) {
        User user = currentUserService.getCurrentUser();
        Category category = categoryService.findActiveOwnedCategory(request.categoryId(), request.type(), user);

        FinancialTransaction transaction = FinancialTransaction.builder()
                .description(request.description().trim())
                .amount(request.amount())
                .type(request.type())
                .transactionDate(request.transactionDate())
                .paymentMethod(request.paymentMethod().trim())
                .note(request.note())
                .recurring(Boolean.TRUE.equals(request.recurring()))
                .status(request.status() != null ? request.status() : com.portfolio.finance.domain.enums.TransactionStatus.CONFIRMED)
                .category(category)
                .user(user)
                .build();

        RecurringTransaction recurringTransaction = recurringTransactionService.createOrUpdateFromTransaction(
                user,
                category,
                request,
                transaction
        );
        transaction.setRecurringTransaction(recurringTransaction);

        return transactionMapper.toResponse(financialTransactionRepository.save(transaction));
    }

    @Transactional
    public TransactionResponse update(Long id, TransactionRequest request) {
        User user = currentUserService.getCurrentUser();
        FinancialTransaction transaction = findOwnedTransaction(id, user);
        Category category = categoryService.findActiveOwnedCategory(request.categoryId(), request.type(), user);

        transaction.setDescription(request.description().trim());
        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setTransactionDate(request.transactionDate());
        transaction.setPaymentMethod(request.paymentMethod().trim());
        transaction.setNote(request.note());
        transaction.setRecurring(Boolean.TRUE.equals(request.recurring()));
        transaction.setStatus(request.status() != null ? request.status() : transaction.getStatus());
        transaction.setCategory(category);

        RecurringTransaction recurringTransaction = recurringTransactionService.createOrUpdateFromTransaction(
                user,
                category,
                request,
                transaction
        );
        transaction.setRecurringTransaction(recurringTransaction);

        return transactionMapper.toResponse(financialTransactionRepository.save(transaction));
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUserService.getCurrentUser();
        FinancialTransaction transaction = findOwnedTransaction(id, user);
        financialTransactionRepository.delete(transaction);
    }

    @Transactional(readOnly = true)
    public FinancialTransaction findOwnedTransaction(Long id, User user) {
        return financialTransactionRepository.findOne(
                (root, query, criteriaBuilder) -> criteriaBuilder.and(
                        criteriaBuilder.equal(root.get("id"), id),
                        criteriaBuilder.equal(root.get("user"), user)
                )
        ).orElseThrow(() -> new NotFoundException("Transação não encontrada."));
    }

    private Specification<FinancialTransaction> buildSpecification(User user, TransactionFilter filter) {
        return (root, query, cb) -> {
            Join<Object, Object> category = root.join("category");
            var predicates = cb.conjunction();

            predicates.getExpressions().add(cb.equal(root.get("user"), user));

            if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
                predicates.getExpressions().add(cb.like(
                        cb.lower(root.get("description")),
                        "%" + filter.getSearch().trim().toLowerCase() + "%"
                ));
            }

            if (filter.getType() != null) {
                predicates.getExpressions().add(cb.equal(root.get("type"), filter.getType()));
            }

            if (filter.getCategoryId() != null) {
                predicates.getExpressions().add(cb.equal(category.get("id"), filter.getCategoryId()));
            }

            if (filter.getStatus() != null) {
                predicates.getExpressions().add(cb.equal(root.get("status"), filter.getStatus()));
            }

            if (filter.getMonth() != null || filter.getYear() != null) {
                int resolvedYear = filter.getYear() != null ? filter.getYear() : LocalDate.now().getYear();
                LocalDate start = filter.getMonth() != null
                        ? LocalDate.of(resolvedYear, filter.getMonth(), 1)
                        : LocalDate.of(resolvedYear, 1, 1);
                LocalDate end = filter.getMonth() != null
                        ? start.withDayOfMonth(start.lengthOfMonth())
                        : LocalDate.of(resolvedYear, 12, 31);
                predicates.getExpressions().add(cb.between(root.get("transactionDate"), start, end));
            }

            if (filter.getStartDate() != null) {
                predicates.getExpressions().add(cb.greaterThanOrEqualTo(root.get("transactionDate"), filter.getStartDate()));
            }

            if (filter.getEndDate() != null) {
                predicates.getExpressions().add(cb.lessThanOrEqualTo(root.get("transactionDate"), filter.getEndDate()));
            }

            if (filter.getMinAmount() != null) {
                predicates.getExpressions().add(cb.greaterThanOrEqualTo(root.get("amount"), filter.getMinAmount()));
            }

            if (filter.getMaxAmount() != null) {
                predicates.getExpressions().add(cb.lessThanOrEqualTo(root.get("amount"), filter.getMaxAmount()));
            }

            return predicates;
        };
    }

    private Sort resolveSort(TransactionFilter filter) {
        Sort.Direction direction = "asc".equalsIgnoreCase(filter.getSortDirection()) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String property = switch (filter.getSortBy()) {
            case "date", "transactionDate" -> "transactionDate";
            case "value", "amount" -> "amount";
            case "category" -> "category.name";
            case "description" -> "description";
            case "status" -> "status";
            default -> "transactionDate";
        };
        return Sort.by(direction, property).and(Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}
