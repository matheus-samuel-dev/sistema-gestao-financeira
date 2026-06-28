package com.portfolio.finance.domain.repository;

import com.portfolio.finance.domain.entity.Category;
import com.portfolio.finance.domain.entity.User;
import com.portfolio.finance.domain.enums.TransactionType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByUserOrderByTypeAscNameAsc(User user);

    List<Category> findAllByUserAndActiveTrueOrderByTypeAscNameAsc(User user);

    List<Category> findAllByUserAndTypeAndActiveTrueOrderByNameAsc(User user, TransactionType type);

    Optional<Category> findByIdAndUser(Long id, User user);

    boolean existsByUserAndNameIgnoreCaseAndType(User user, String name, TransactionType type);
}
