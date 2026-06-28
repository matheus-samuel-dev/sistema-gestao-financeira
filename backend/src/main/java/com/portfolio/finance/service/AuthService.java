package com.portfolio.finance.service;

import com.portfolio.finance.domain.entity.User;
import com.portfolio.finance.domain.repository.UserRepository;
import com.portfolio.finance.dto.auth.AuthResponse;
import com.portfolio.finance.dto.auth.LoginRequest;
import com.portfolio.finance.dto.auth.RegisterRequest;
import com.portfolio.finance.exception.BusinessRuleException;
import com.portfolio.finance.mapper.UserMapper;
import com.portfolio.finance.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserMapper userMapper;
    private final CurrentUserService currentUserService;
    private final CategoryBootstrapService categoryBootstrapService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserDetailsService userDetailsService,
            UserMapper userMapper,
            CurrentUserService currentUserService,
            CategoryBootstrapService categoryBootstrapService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.userMapper = userMapper;
        this.currentUserService = currentUserService;
        this.categoryBootstrapService = categoryBootstrapService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BusinessRuleException("Já existe uma conta cadastrada com este e-mail.");
        }

        User user = User.builder()
                .name(request.name().trim())
                .email(request.email().trim().toLowerCase())
                .password(passwordEncoder.encode(request.password()))
                .accountType(request.accountType())
                .build();

        User savedUser = userRepository.save(user);
        categoryBootstrapService.createDefaultsForUser(savedUser);

        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        return new AuthResponse(jwtService.generateToken(userDetails), userMapper.toProfile(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
        );

        User user = userRepository.findByEmailIgnoreCase(request.email().trim().toLowerCase())
                .orElseThrow(() -> new BusinessRuleException("Credenciais inválidas."));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        return new AuthResponse(jwtService.generateToken(userDetails), userMapper.toProfile(user));
    }

    public AuthResponse me() {
        User user = currentUserService.getCurrentUser();
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        return new AuthResponse(jwtService.generateToken(userDetails), userMapper.toProfile(user));
    }
}
