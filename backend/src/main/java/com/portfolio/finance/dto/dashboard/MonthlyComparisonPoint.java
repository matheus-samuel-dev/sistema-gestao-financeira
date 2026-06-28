package com.portfolio.finance.dto.dashboard;

import java.math.BigDecimal;

public record MonthlyComparisonPoint(
        String label,
        BigDecimal income,
        BigDecimal expense
) {
}
