package com.portfolio.finance.dto.report;

import java.math.BigDecimal;

public record ReportCategorySummary(
        String category,
        BigDecimal total,
        String color
) {
}
