package com.portfolio.finance.dto.report;

import java.math.BigDecimal;

public record ReportMonthlySummary(
        String month,
        BigDecimal income,
        BigDecimal expense,
        BigDecimal net
) {
}
