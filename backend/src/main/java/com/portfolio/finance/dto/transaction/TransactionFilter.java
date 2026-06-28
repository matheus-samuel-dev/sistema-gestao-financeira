package com.portfolio.finance.dto.transaction;

import com.portfolio.finance.domain.enums.TransactionStatus;
import com.portfolio.finance.domain.enums.TransactionType;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TransactionFilter {

    private String search;
    private TransactionType type;
    private Long categoryId;
    private Integer month;
    private Integer year;
    private LocalDate startDate;
    private LocalDate endDate;
    private TransactionStatus status;
    @Builder.Default
    private int page = 0;
    @Builder.Default
    private int size = 10;
    @Builder.Default
    private String sortBy = "transactionDate";
    @Builder.Default
    private String sortDirection = "desc";
}
