package com.portfolio.finance.service;

import com.portfolio.finance.domain.entity.FinancialTransaction;
import com.portfolio.finance.domain.enums.TransactionType;
import com.portfolio.finance.dto.report.ReportCategorySummary;
import com.portfolio.finance.dto.report.ReportMonthlySummary;
import com.portfolio.finance.dto.report.ReportResponse;
import com.portfolio.finance.dto.transaction.TransactionFilter;
import com.portfolio.finance.dto.transaction.TransactionResponse;
import com.portfolio.finance.mapper.TransactionMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    private static final Locale LOCALE_PT_BR = Locale.forLanguageTag("pt-BR");
    private static final DateTimeFormatter MONTH_LABEL_FORMATTER = DateTimeFormatter.ofPattern("MMM/yy", LOCALE_PT_BR);

    private final TransactionService transactionService;
    private final TransactionMapper transactionMapper;

    public ReportService(TransactionService transactionService, TransactionMapper transactionMapper) {
        this.transactionService = transactionService;
        this.transactionMapper = transactionMapper;
    }

    @Transactional
    public ReportResponse generate(
            Integer month,
            Integer year,
            TransactionType type,
            Long categoryId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        TransactionFilter filter = TransactionFilter.builder()
                .month(month)
                .year(year)
                .type(type)
                .categoryId(categoryId)
                .startDate(startDate)
                .endDate(endDate)
                .page(0)
                .size(3000)
                .sortBy("transactionDate")
                .sortDirection("desc")
                .build();

        List<FinancialTransaction> filteredTransactions = transactionService.findEntitiesForCurrentUser(filter);
        BigDecimal totalIncome = sumByType(filteredTransactions, TransactionType.INCOME);
        BigDecimal totalExpense = sumByType(filteredTransactions, TransactionType.EXPENSE);

        return new ReportResponse(
                totalIncome,
                totalExpense,
                totalIncome.subtract(totalExpense),
                buildCategorySummary(filteredTransactions, TransactionType.INCOME),
                buildCategorySummary(filteredTransactions, TransactionType.EXPENSE),
                filteredTransactions.stream()
                        .filter(transaction -> transaction.getType() == TransactionType.EXPENSE)
                        .sorted(Comparator.comparing(FinancialTransaction::getAmount).reversed())
                        .limit(10)
                        .map(transactionMapper::toResponse)
                        .toList(),
                buildMonthlySummaries(filteredTransactions),
                buildComparisonSummaries(filteredTransactions, endDate != null ? endDate : LocalDate.now())
        );
    }

    private BigDecimal sumByType(List<FinancialTransaction> transactions, TransactionType type) {
        return transactions.stream()
                .filter(transaction -> transaction.getType() == type)
                .map(FinancialTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<ReportCategorySummary> buildCategorySummary(List<FinancialTransaction> transactions, TransactionType type) {
        return transactions.stream()
                .filter(transaction -> transaction.getType() == type)
                .collect(Collectors.groupingBy(
                        FinancialTransaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, FinancialTransaction::getAmount, BigDecimal::add)
                ))
                .entrySet()
                .stream()
                .map(entry -> new ReportCategorySummary(
                        entry.getKey().getName(),
                        entry.getValue(),
                        entry.getKey().getColor()
                ))
                .sorted(Comparator.comparing(ReportCategorySummary::total).reversed())
                .toList();
    }

    private List<ReportMonthlySummary> buildMonthlySummaries(List<FinancialTransaction> transactions) {
        Map<YearMonth, List<FinancialTransaction>> grouped = transactions.stream()
                .collect(Collectors.groupingBy(transaction -> YearMonth.from(transaction.getTransactionDate())));

        return grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    BigDecimal income = sumByType(entry.getValue(), TransactionType.INCOME);
                    BigDecimal expense = sumByType(entry.getValue(), TransactionType.EXPENSE);
                    return new ReportMonthlySummary(
                            entry.getKey().format(MONTH_LABEL_FORMATTER),
                            income,
                            expense,
                            income.subtract(expense)
                    );
                })
                .toList();
    }

    private List<ReportMonthlySummary> buildComparisonSummaries(List<FinancialTransaction> transactions, LocalDate referenceDate) {
        List<ReportMonthlySummary> summaries = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth month = YearMonth.from(referenceDate).minusMonths(i);
            List<FinancialTransaction> monthTransactions = transactions.stream()
                    .filter(transaction -> YearMonth.from(transaction.getTransactionDate()).equals(month))
                    .toList();
            BigDecimal income = sumByType(monthTransactions, TransactionType.INCOME);
            BigDecimal expense = sumByType(monthTransactions, TransactionType.EXPENSE);
            summaries.add(new ReportMonthlySummary(month.format(MONTH_LABEL_FORMATTER), income, expense, income.subtract(expense)));
        }
        return summaries;
    }
}
