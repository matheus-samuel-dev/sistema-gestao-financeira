package com.portfolio.finance.mapper;

import com.portfolio.finance.domain.entity.Category;
import com.portfolio.finance.dto.category.CategoryResponse;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getType(),
                category.getColor(),
                category.getIcon(),
                category.getActive(),
                category.getSystemDefault()
        );
    }
}
