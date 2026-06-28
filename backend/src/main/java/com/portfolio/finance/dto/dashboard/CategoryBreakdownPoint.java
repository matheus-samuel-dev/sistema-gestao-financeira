package com.portfolio.finance.dto.dashboard;

import java.math.BigDecimal;

public record CategoryBreakdownPoint(
        String name,
        BigDecimal value,
        String color
) {
}
