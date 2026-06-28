package com.portfolio.finance.controller;

import com.portfolio.finance.dto.recurring.RecurringTransactionRequest;
import com.portfolio.finance.dto.recurring.RecurringTransactionResponse;
import com.portfolio.finance.service.RecurringTransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recurring-transactions")
@Tag(name = "Recorrências", description = "Cadastro e manutenção de transações recorrentes")
public class RecurringTransactionController {

    private final RecurringTransactionService recurringTransactionService;

    public RecurringTransactionController(RecurringTransactionService recurringTransactionService) {
        this.recurringTransactionService = recurringTransactionService;
    }

    @GetMapping
    @Operation(summary = "Listar transações recorrentes")
    public List<RecurringTransactionResponse> list() {
        return recurringTransactionService.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar transação recorrente")
    public RecurringTransactionResponse create(@Valid @RequestBody RecurringTransactionRequest request) {
        return recurringTransactionService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar transação recorrente")
    public RecurringTransactionResponse update(@PathVariable Long id, @Valid @RequestBody RecurringTransactionRequest request) {
        return recurringTransactionService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Inativar transação recorrente")
    public void delete(@PathVariable Long id) {
        recurringTransactionService.delete(id);
    }
}
