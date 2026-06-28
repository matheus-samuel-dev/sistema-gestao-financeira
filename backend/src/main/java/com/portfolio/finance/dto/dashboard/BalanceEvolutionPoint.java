package com.portfolio.finance.dto.dashboard;

import java.math.BigDecimal;

public record BalanceEvolutionPoint(
        String label,
        BigDecimal balance
) {
}
