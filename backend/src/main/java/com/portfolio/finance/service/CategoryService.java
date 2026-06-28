package com.portfolio.finance.service;

import com.portfolio.finance.domain.entity.Category;
import com.portfolio.finance.domain.entity.User;
import com.portfolio.finance.domain.enums.TransactionType;
import com.portfolio.finance.domain.repository.CategoryRepository;
import com.portfolio.finance.domain.repository.FinancialTransactionRepository;
import com.portfolio.finance.dto.category.CategoryRequest;
import com.portfolio.finance.dto.category.CategoryResponse;
import com.portfolio.finance.dto.category.CategoryStatusRequest;
import com.portfolio.finance.exception.BusinessRuleException;
import com.portfolio.finance.exception.NotFoundException;
import com.portfolio.finance.mapper.CategoryMapper;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final FinancialTransactionRepository financialTransactionRepository;
    private final CurrentUserService currentUserService;
    private final CategoryMapper categoryMapper;

    public CategoryService(
            CategoryRepository categoryRepository,
            FinancialTransactionRepository financialTransactionRepository,
            CurrentUserService currentUserService,
            CategoryMapper categoryMapper
    ) {
        this.categoryRepository = categoryRepository;
        this.financialTransactionRepository = financialTransactionRepository;
        this.currentUserService = currentUserService;
        this.categoryMapper = categoryMapper;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> list(Boolean activeOnly, TransactionType type) {
        User user = currentUserService.getCurrentUser();
        List<Category> categories;

        if (Boolean.TRUE.equals(activeOnly) && type != null) {
            categories = categoryRepository.findAllByUserAndTypeAndActiveTrueOrderByNameAsc(user, type);
        } else if (Boolean.TRUE.equals(activeOnly)) {
            categories = categoryRepository.findAllByUserAndActiveTrueOrderByTypeAscNameAsc(user);
        } else {
            categories = categoryRepository.findAllByUserOrderByTypeAscNameAsc(user);
        }

        return categories.stream().map(categoryMapper::toResponse).toList();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        User user = currentUserService.getCurrentUser();
        validateDuplicate(user, request.name(), request.type(), null);

        Category category = Category.builder()
                .name(request.name().trim())
                .type(request.type())
                .color(request.color().toUpperCase())
                .icon(request.icon().trim())
                .active(request.active() == null || request.active())
                .systemDefault(false)
                .user(user)
                .build();

        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        User user = currentUserService.getCurrentUser();
        Category category = findOwnedCategory(id, user);
        validateDuplicate(user, request.name(), request.type(), id);

        category.setName(request.name().trim());
        category.setType(request.type());
        category.setColor(request.color().toUpperCase());
        category.setIcon(request.icon().trim());
        if (request.active() != null) {
            category.setActive(request.active());
        }

        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateStatus(Long id, CategoryStatusRequest request) {
        User user = currentUserService.getCurrentUser();
        Category category = findOwnedCategory(id, user);
        category.setActive(request.active());
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUserService.getCurrentUser();
        Category category = findOwnedCategory(id, user);

        if (financialTransactionRepository.existsByCategoryId(category.getId())) {
            throw new BusinessRuleException("Categoria em uso não pode ser excluída. Inative-a para preservação do histórico.");
        }

        if (Boolean.TRUE.equals(category.getSystemDefault())) {
            throw new BusinessRuleException("Categorias padrão não podem ser excluídas. Inative-a se não quiser mais usar.");
        }

        categoryRepository.delete(category);
    }

    @Transactional(readOnly = true)
    public Category findActiveOwnedCategory(Long categoryId, TransactionType transactionType, User user) {
        Category category = findOwnedCategory(categoryId, user);

        if (!Boolean.TRUE.equals(category.getActive())) {
            throw new BusinessRuleException("A categoria selecionada está inativa.");
        }

        if (category.getType() != transactionType) {
            throw new BusinessRuleException("A categoria selecionada não corresponde ao tipo da transação.");
        }

        return category;
    }

    @Transactional(readOnly = true)
    public Category findOwnedCategory(Long categoryId, User user) {
        return categoryRepository.findByIdAndUser(categoryId, user)
                .orElseThrow(() -> new NotFoundException("Categoria não encontrada."));
    }

    private void validateDuplicate(User user, String name, TransactionType type, Long currentId) {
        boolean duplicate = categoryRepository.findAllByUserOrderByTypeAscNameAsc(user)
                .stream()
                .anyMatch(category -> category.getName().equalsIgnoreCase(name.trim())
                        && category.getType() == type
                        && (currentId == null || !category.getId().equals(currentId)));
        if (duplicate) {
            throw new BusinessRuleException("Já existe uma categoria com este nome para o tipo informado.");
        }
    }
}
