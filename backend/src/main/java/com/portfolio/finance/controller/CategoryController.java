package com.portfolio.finance.controller;

import com.portfolio.finance.domain.enums.TransactionType;
import com.portfolio.finance.dto.category.CategoryRequest;
import com.portfolio.finance.dto.category.CategoryResponse;
import com.portfolio.finance.dto.category.CategoryStatusRequest;
import com.portfolio.finance.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Categorias", description = "CRUD de categorias de receitas e despesas")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @Operation(summary = "Listar categorias")
    public List<CategoryResponse> list(
            @Parameter(description = "Retorna apenas categorias ativas") @RequestParam(required = false) Boolean activeOnly,
            @Parameter(description = "Filtrar por tipo") @RequestParam(required = false) TransactionType type
    ) {
        return categoryService.list(activeOnly, type);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar categoria")
    public CategoryResponse create(@Valid @RequestBody CategoryRequest request) {
        return categoryService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar categoria")
    public CategoryResponse update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return categoryService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Ativar ou inativar categoria")
    public CategoryResponse updateStatus(@PathVariable Long id, @Valid @RequestBody CategoryStatusRequest request) {
        return categoryService.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Excluir categoria")
    public void delete(@PathVariable Long id) {
        categoryService.delete(id);
    }
}
