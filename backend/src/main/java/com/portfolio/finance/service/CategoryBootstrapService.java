package com.portfolio.finance.service;

import com.portfolio.finance.domain.entity.Category;
import com.portfolio.finance.domain.entity.User;
import com.portfolio.finance.domain.enums.TransactionType;
import com.portfolio.finance.domain.repository.CategoryRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryBootstrapService {

    private final CategoryRepository categoryRepository;

    public CategoryBootstrapService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public void createDefaultsForUser(User user) {
        if (!categoryRepository.findAllByUserOrderByTypeAscNameAsc(user).isEmpty()) {
            return;
        }

        List<CategorySeed> presets = List.of(
                new CategorySeed("Salário", TransactionType.INCOME, "#10B981", "payments"),
                new CategorySeed("Freelance", TransactionType.INCOME, "#0EA5E9", "laptop_mac"),
                new CategorySeed("Investimentos", TransactionType.INCOME, "#F59E0B", "trending_up"),
                new CategorySeed("Vendas", TransactionType.INCOME, "#8B5CF6", "shopping_bag"),
                new CategorySeed("Reembolso", TransactionType.INCOME, "#14B8A6", "currency_exchange"),
                new CategorySeed("Outros", TransactionType.INCOME, "#64748B", "paid"),
                new CategorySeed("Alimentação", TransactionType.EXPENSE, "#EF4444", "restaurant"),
                new CategorySeed("Moradia", TransactionType.EXPENSE, "#F97316", "home"),
                new CategorySeed("Transporte", TransactionType.EXPENSE, "#EAB308", "directions_car"),
                new CategorySeed("Saúde", TransactionType.EXPENSE, "#EC4899", "favorite"),
                new CategorySeed("Educação", TransactionType.EXPENSE, "#3B82F6", "school"),
                new CategorySeed("Lazer", TransactionType.EXPENSE, "#A855F7", "sports_esports"),
                new CategorySeed("Tecnologia", TransactionType.EXPENSE, "#06B6D4", "devices"),
                new CategorySeed("Contas Fixas", TransactionType.EXPENSE, "#334155", "receipt_long"),
                new CategorySeed("Impostos", TransactionType.EXPENSE, "#B91C1C", "gavel"),
                new CategorySeed("Outros", TransactionType.EXPENSE, "#78716C", "category")
        );

        List<Category> categories = presets.stream()
                .map(preset -> Category.builder()
                        .name(preset.name())
                        .type(preset.type())
                        .color(preset.color())
                        .icon(preset.icon())
                        .active(true)
                        .systemDefault(true)
                        .user(user)
                        .build())
                .toList();

        categoryRepository.saveAll(categories);
    }

    private record CategorySeed(String name, TransactionType type, String color, String icon) {
    }
}
