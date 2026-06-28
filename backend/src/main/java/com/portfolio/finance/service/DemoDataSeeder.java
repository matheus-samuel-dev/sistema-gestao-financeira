package com.portfolio.finance.service;

import com.portfolio.finance.domain.entity.Category;
import com.portfolio.finance.domain.entity.FinancialGoal;
import com.portfolio.finance.domain.entity.FinancialTransaction;
import com.portfolio.finance.domain.entity.RecurringTransaction;
import com.portfolio.finance.domain.entity.User;
import com.portfolio.finance.domain.enums.AccountType;
import com.portfolio.finance.domain.enums.GoalStatus;
import com.portfolio.finance.domain.enums.RecurringFrequency;
import com.portfolio.finance.domain.enums.TransactionStatus;
import com.portfolio.finance.domain.enums.TransactionType;
import com.portfolio.finance.domain.repository.CategoryRepository;
import com.portfolio.finance.domain.repository.FinancialGoalRepository;
import com.portfolio.finance.domain.repository.FinancialTransactionRepository;
import com.portfolio.finance.domain.repository.RecurringTransactionRepository;
import com.portfolio.finance.domain.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DemoDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryBootstrapService categoryBootstrapService;
    private final CategoryRepository categoryRepository;
    private final FinancialTransactionRepository financialTransactionRepository;
    private final FinancialGoalRepository financialGoalRepository;
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final RecurringTransactionService recurringTransactionService;

    public DemoDataSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            CategoryBootstrapService categoryBootstrapService,
            CategoryRepository categoryRepository,
            FinancialTransactionRepository financialTransactionRepository,
            FinancialGoalRepository financialGoalRepository,
            RecurringTransactionRepository recurringTransactionRepository,
            RecurringTransactionService recurringTransactionService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.categoryBootstrapService = categoryBootstrapService;
        this.categoryRepository = categoryRepository;
        this.financialTransactionRepository = financialTransactionRepository;
        this.financialGoalRepository = financialGoalRepository;
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.recurringTransactionService = recurringTransactionService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByEmailIgnoreCase("demo@financeiro.com")) {
            return;
        }

        User demoUser = userRepository.save(User.builder()
                .name("Conta Demo")
                .email("demo@financeiro.com")
                .password(passwordEncoder.encode("123456"))
                .accountType(AccountType.BUSINESS)
                .build());

        categoryBootstrapService.createDefaultsForUser(demoUser);

        Category salario = findCategory(demoUser, "Salário", TransactionType.INCOME);
        Category freelance = findCategory(demoUser, "Freelance", TransactionType.INCOME);
        Category vendas = findCategory(demoUser, "Vendas", TransactionType.INCOME);
        Category moradia = findCategory(demoUser, "Moradia", TransactionType.EXPENSE);
        Category alimentacao = findCategory(demoUser, "Alimentação", TransactionType.EXPENSE);
        Category tecnologia = findCategory(demoUser, "Tecnologia", TransactionType.EXPENSE);
        Category contasFixas = findCategory(demoUser, "Contas Fixas", TransactionType.EXPENSE);
        Category transporte = findCategory(demoUser, "Transporte", TransactionType.EXPENSE);

        financialTransactionRepository.saveAll(List.of(
                buildTransaction(demoUser, salario, "Salário principal", "PIX", new BigDecimal("7800.00"), LocalDate.now().minusMonths(5).withDayOfMonth(5), TransactionType.INCOME),
                buildTransaction(demoUser, freelance, "Projeto de landing page", "Transferência", new BigDecimal("3200.00"), LocalDate.now().minusMonths(5).withDayOfMonth(16), TransactionType.INCOME),
                buildTransaction(demoUser, moradia, "Aluguel do escritório", "Débito automático", new BigDecimal("2100.00"), LocalDate.now().minusMonths(5).withDayOfMonth(8), TransactionType.EXPENSE),
                buildTransaction(demoUser, tecnologia, "Ferramentas SaaS", "Cartão", new BigDecimal("890.00"), LocalDate.now().minusMonths(5).withDayOfMonth(12), TransactionType.EXPENSE),
                buildTransaction(demoUser, salario, "Salário principal", "PIX", new BigDecimal("7800.00"), LocalDate.now().minusMonths(4).withDayOfMonth(5), TransactionType.INCOME),
                buildTransaction(demoUser, vendas, "Venda de consultoria", "Boleto", new BigDecimal("5100.00"), LocalDate.now().minusMonths(4).withDayOfMonth(18), TransactionType.INCOME),
                buildTransaction(demoUser, alimentacao, "Almoços da equipe", "Cartão", new BigDecimal("760.00"), LocalDate.now().minusMonths(4).withDayOfMonth(20), TransactionType.EXPENSE),
                buildTransaction(demoUser, transporte, "Combustível", "Cartão", new BigDecimal("420.00"), LocalDate.now().minusMonths(4).withDayOfMonth(23), TransactionType.EXPENSE),
                buildTransaction(demoUser, salario, "Salário principal", "PIX", new BigDecimal("7800.00"), LocalDate.now().minusMonths(3).withDayOfMonth(5), TransactionType.INCOME),
                buildTransaction(demoUser, freelance, "Mentoria financeira", "Transferência", new BigDecimal("2400.00"), LocalDate.now().minusMonths(3).withDayOfMonth(10), TransactionType.INCOME),
                buildTransaction(demoUser, moradia, "Aluguel do escritório", "Débito automático", new BigDecimal("2100.00"), LocalDate.now().minusMonths(3).withDayOfMonth(8), TransactionType.EXPENSE),
                buildTransaction(demoUser, contasFixas, "Internet e energia", "Débito automático", new BigDecimal("680.00"), LocalDate.now().minusMonths(3).withDayOfMonth(12), TransactionType.EXPENSE),
                buildTransaction(demoUser, salario, "Salário principal", "PIX", new BigDecimal("7800.00"), LocalDate.now().minusMonths(2).withDayOfMonth(5), TransactionType.INCOME),
                buildTransaction(demoUser, vendas, "Pacote de consultoria", "PIX", new BigDecimal("4600.00"), LocalDate.now().minusMonths(2).withDayOfMonth(14), TransactionType.INCOME),
                buildTransaction(demoUser, tecnologia, "Notebook parcelado", "Cartão", new BigDecimal("1250.00"), LocalDate.now().minusMonths(2).withDayOfMonth(17), TransactionType.EXPENSE),
                buildTransaction(demoUser, alimentacao, "Mercado do mês", "Cartão", new BigDecimal("910.00"), LocalDate.now().minusMonths(2).withDayOfMonth(19), TransactionType.EXPENSE),
                buildTransaction(demoUser, salario, "Salário principal", "PIX", new BigDecimal("7800.00"), LocalDate.now().minusMonths(1).withDayOfMonth(5), TransactionType.INCOME),
                buildTransaction(demoUser, freelance, "Projeto de dashboard", "PIX", new BigDecimal("3500.00"), LocalDate.now().minusMonths(1).withDayOfMonth(21), TransactionType.INCOME),
                buildTransaction(demoUser, moradia, "Aluguel do escritório", "Débito automático", new BigDecimal("2100.00"), LocalDate.now().minusMonths(1).withDayOfMonth(8), TransactionType.EXPENSE),
                buildTransaction(demoUser, contasFixas, "Internet e energia", "Débito automático", new BigDecimal("710.00"), LocalDate.now().minusMonths(1).withDayOfMonth(12), TransactionType.EXPENSE),
                buildTransaction(demoUser, salario, "Salário principal", "PIX", new BigDecimal("7800.00"), LocalDate.now().withDayOfMonth(5), TransactionType.INCOME),
                buildTransaction(demoUser, vendas, "Plano premium anual", "Cartão", new BigDecimal("6200.00"), LocalDate.now().withDayOfMonth(15), TransactionType.INCOME),
                buildTransaction(demoUser, alimentacao, "Restaurantes e cafés", "Cartão", new BigDecimal("980.00"), LocalDate.now().withDayOfMonth(9), TransactionType.EXPENSE),
                buildTransaction(demoUser, tecnologia, "Assinaturas e cloud", "Cartão", new BigDecimal("940.00"), LocalDate.now().withDayOfMonth(18), TransactionType.EXPENSE)
        ));

        financialGoalRepository.saveAll(List.of(
                FinancialGoal.builder()
                        .name("Reserva de emergência")
                        .targetAmount(new BigDecimal("30000.00"))
                        .currentAmount(new BigDecimal("18500.00"))
                        .deadline(LocalDate.now().plusMonths(4))
                        .description("Meta para garantir seis meses de segurança financeira.")
                        .status(GoalStatus.IN_PROGRESS)
                        .category(moradia)
                        .user(demoUser)
                        .build(),
                FinancialGoal.builder()
                        .name("Upgrade de equipamentos")
                        .targetAmount(new BigDecimal("12000.00"))
                        .currentAmount(new BigDecimal("6700.00"))
                        .deadline(LocalDate.now().plusMonths(2))
                        .description("Troca de notebook, monitor e periféricos do escritório.")
                        .status(GoalStatus.IN_PROGRESS)
                        .category(tecnologia)
                        .user(demoUser)
                        .build()
        ));

        RecurringTransaction salaryRecurring = recurringTransactionRepository.save(RecurringTransaction.builder()
                .description("Salário principal")
                .amount(new BigDecimal("7800.00"))
                .type(TransactionType.INCOME)
                .paymentMethod("PIX")
                .note("Receita recorrente mensal")
                .frequency(RecurringFrequency.MONTHLY)
                .startDate(LocalDate.now().minusMonths(1).withDayOfMonth(5))
                .nextExecution(LocalDate.now().plusMonths(1).withDayOfMonth(5))
                .active(true)
                .category(salario)
                .user(demoUser)
                .build());

        RecurringTransaction rentRecurring = recurringTransactionRepository.save(RecurringTransaction.builder()
                .description("Aluguel do escritório")
                .amount(new BigDecimal("2100.00"))
                .type(TransactionType.EXPENSE)
                .paymentMethod("Débito automático")
                .note("Despesa fixa mensal")
                .frequency(RecurringFrequency.MONTHLY)
                .startDate(LocalDate.now().minusMonths(1).withDayOfMonth(8))
                .nextExecution(LocalDate.now().plusMonths(1).withDayOfMonth(8))
                .active(true)
                .category(moradia)
                .user(demoUser)
                .build());

        financialTransactionRepository.save(buildRecurringTransaction(demoUser, salario, salaryRecurring, new BigDecimal("7800.00"), LocalDate.now().minusMonths(1).withDayOfMonth(5), TransactionType.INCOME));
        financialTransactionRepository.save(buildRecurringTransaction(demoUser, moradia, rentRecurring, new BigDecimal("2100.00"), LocalDate.now().minusMonths(1).withDayOfMonth(8), TransactionType.EXPENSE));

        recurringTransactionService.syncDueTransactions(demoUser, LocalDate.now());
    }

    private Category findCategory(User user, String name, TransactionType type) {
        return categoryRepository.findAllByUserOrderByTypeAscNameAsc(user).stream()
                .filter(category -> category.getName().equalsIgnoreCase(name) && category.getType() == type)
                .findFirst()
                .orElseThrow();
    }

    private FinancialTransaction buildTransaction(
            User user,
            Category category,
            String description,
            String paymentMethod,
            BigDecimal amount,
            LocalDate date,
            TransactionType type
    ) {
        return FinancialTransaction.builder()
                .description(description)
                .amount(amount)
                .type(type)
                .transactionDate(date)
                .paymentMethod(paymentMethod)
                .note("Lançamento inicial para demonstração do dashboard.")
                .status(TransactionStatus.CONFIRMED)
                .recurring(false)
                .category(category)
                .user(user)
                .build();
    }

    private FinancialTransaction buildRecurringTransaction(
            User user,
            Category category,
            RecurringTransaction recurringTransaction,
            BigDecimal amount,
            LocalDate date,
            TransactionType type
    ) {
        return FinancialTransaction.builder()
                .description(recurringTransaction.getDescription())
                .amount(amount)
                .type(type)
                .transactionDate(date)
                .paymentMethod(recurringTransaction.getPaymentMethod())
                .note(recurringTransaction.getNote())
                .status(TransactionStatus.CONFIRMED)
                .recurring(true)
                .category(category)
                .user(user)
                .recurringTransaction(recurringTransaction)
                .build();
    }
}
