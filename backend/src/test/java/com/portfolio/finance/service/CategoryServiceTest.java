package com.portfolio.finance.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.portfolio.finance.domain.entity.Category;
import com.portfolio.finance.domain.entity.User;
import com.portfolio.finance.domain.enums.AccountType;
import com.portfolio.finance.domain.enums.TransactionType;
import com.portfolio.finance.domain.repository.CategoryRepository;
import com.portfolio.finance.domain.repository.FinancialTransactionRepository;
import com.portfolio.finance.dto.category.CategoryRequest;
import com.portfolio.finance.dto.category.CategoryResponse;
import com.portfolio.finance.exception.BusinessRuleException;
import com.portfolio.finance.mapper.CategoryMapper;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private FinancialTransactionRepository financialTransactionRepository;
    @Mock
    private CurrentUserService currentUserService;

    private CategoryService categoryService;
    private User user;

    @BeforeEach
    void setUp() {
        categoryService = new CategoryService(
                categoryRepository,
                financialTransactionRepository,
                currentUserService,
                new CategoryMapper()
        );
        user = User.builder()
                .id(1L)
                .name("Demo")
                .email("demo@financeiro.com")
                .password("encoded")
                .accountType(AccountType.BUSINESS)
                .build();
    }

    @Test
    void createRejectsDuplicatedNameForSameType() {
        Category existing = Category.builder()
                .id(10L)
                .name("Alimentação")
                .type(TransactionType.EXPENSE)
                .color("#EF4444")
                .icon("restaurant")
                .active(true)
                .user(user)
                .build();

        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(categoryRepository.findAllByUserOrderByTypeAscNameAsc(user)).thenReturn(List.of(existing));

        CategoryRequest request = new CategoryRequest("alimentação", TransactionType.EXPENSE, "#EF4444", "restaurant", true);

        assertThatThrownBy(() -> categoryService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Já existe uma categoria");
    }

    @Test
    void deleteRejectsCategoryInUse() {
        Category category = Category.builder()
                .id(10L)
                .name("Tecnologia")
                .type(TransactionType.EXPENSE)
                .color("#06B6D4")
                .icon("devices")
                .active(true)
                .systemDefault(false)
                .user(user)
                .build();

        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(categoryRepository.findByIdAndUser(10L, user)).thenReturn(Optional.of(category));
        when(financialTransactionRepository.existsByCategoryId(10L)).thenReturn(true);

        assertThatThrownBy(() -> categoryService.delete(10L))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Categoria em uso");
    }

    @Test
    void createPersistsCustomCategory() {
        CategoryRequest request = new CategoryRequest("Consultoria", TransactionType.INCOME, "#0E7490", "paid", true);
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(categoryRepository.findAllByUserOrderByTypeAscNameAsc(user)).thenReturn(List.of());
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category category = invocation.getArgument(0);
            category.setId(99L);
            return category;
        });

        CategoryResponse response = categoryService.create(request);

        assertThat(response.id()).isEqualTo(99L);
        assertThat(response.name()).isEqualTo("Consultoria");
        assertThat(response.type()).isEqualTo(TransactionType.INCOME);
        verify(categoryRepository).save(any(Category.class));
    }
}
