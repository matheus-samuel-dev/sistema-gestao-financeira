package com.portfolio.finance.dto.category;

import jakarta.validation.constraints.NotNull;

public record CategoryStatusRequest(
        @NotNull(message = "Informe o novo status.")
        Boolean active
) {
}
