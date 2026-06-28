package com.portfolio.finance.dto.category;

import com.portfolio.finance.domain.enums.TransactionType;

public record CategoryResponse(
        Long id,
        String name,
        TransactionType type,
        String color,
        String icon,
        Boolean active,
        Boolean systemDefault
) {
}
