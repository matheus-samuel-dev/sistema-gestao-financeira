package com.portfolio.finance.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.portfolio.finance.domain.entity.User;
import com.portfolio.finance.domain.enums.AccountType;
import com.portfolio.finance.domain.enums.ThemePreference;
import com.portfolio.finance.domain.repository.UserRepository;
import com.portfolio.finance.dto.auth.AuthResponse;
import com.portfolio.finance.dto.auth.LoginRequest;
import com.portfolio.finance.dto.auth.RegisterRequest;
import com.portfolio.finance.dto.profile.UserProfileResponse;
import com.portfolio.finance.exception.BusinessRuleException;
import com.portfolio.finance.mapper.UserMapper;
import com.portfolio.finance.security.JwtService;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;
    @Mock
    private UserDetailsService userDetailsService;
    @Mock
    private UserMapper userMapper;
    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private CategoryBootstrapService categoryBootstrapService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                passwordEncoder,
                authenticationManager,
                jwtService,
                userDetailsService,
                userMapper,
                currentUserService,
                categoryBootstrapService
        );
    }

    @Test
    void registerCreatesUserWithEncodedPasswordAndDefaultCategories() {
        RegisterRequest request = new RegisterRequest("Maria Silva", "MARIA@EMAIL.COM", "123456", AccountType.PERSONAL);
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("maria@email.com")
                .password("encoded")
                .authorities("USER")
                .build();
        User savedUser = User.builder()
                .id(1L)
                .name("Maria Silva")
                .email("maria@email.com")
                .password("encoded")
                .accountType(AccountType.PERSONAL)
                .themePreference(ThemePreference.LIGHT)
                .createdAt(OffsetDateTime.now())
                .build();

        when(userRepository.existsByEmailIgnoreCase("MARIA@EMAIL.COM")).thenReturn(false);
        when(passwordEncoder.encode("123456")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(userDetailsService.loadUserByUsername("maria@email.com")).thenReturn(userDetails);
        when(jwtService.generateToken(userDetails)).thenReturn("jwt-token");
        when(userMapper.toProfile(savedUser)).thenReturn(new UserProfileResponse(
                1L,
                "Maria Silva",
                "maria@email.com",
                AccountType.PERSONAL,
                ThemePreference.LIGHT,
                savedUser.getCreatedAt()
        ));

        AuthResponse response = authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getEmail()).isEqualTo("maria@email.com");
        assertThat(userCaptor.getValue().getPassword()).isEqualTo("encoded");
        verify(categoryBootstrapService).createDefaultsForUser(savedUser);
        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.user().email()).isEqualTo("maria@email.com");
    }

    @Test
    void registerRejectsDuplicatedEmail() {
        RegisterRequest request = new RegisterRequest("Maria Silva", "maria@email.com", "123456", AccountType.PERSONAL);
        when(userRepository.existsByEmailIgnoreCase("maria@email.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Já existe uma conta");
    }

    @Test
    void loginAuthenticatesWithNormalizedEmailAndReturnsJwt() {
        LoginRequest request = new LoginRequest(" MARIA@EMAIL.COM ", "123456");
        User user = User.builder()
                .id(1L)
                .name("Maria Silva")
                .email("maria@email.com")
                .password("encoded")
                .accountType(AccountType.PERSONAL)
                .themePreference(ThemePreference.LIGHT)
                .createdAt(OffsetDateTime.now())
                .build();
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("maria@email.com")
                .password("encoded")
                .authorities("USER")
                .build();

        when(userRepository.findByEmailIgnoreCase("maria@email.com")).thenReturn(java.util.Optional.of(user));
        when(userDetailsService.loadUserByUsername("maria@email.com")).thenReturn(userDetails);
        when(jwtService.generateToken(userDetails)).thenReturn("jwt-token");
        when(userMapper.toProfile(user)).thenReturn(new UserProfileResponse(
                1L,
                "Maria Silva",
                "maria@email.com",
                AccountType.PERSONAL,
                ThemePreference.LIGHT,
                user.getCreatedAt()
        ));

        AuthResponse response = authService.login(request);

        ArgumentCaptor<UsernamePasswordAuthenticationToken> authenticationCaptor =
                ArgumentCaptor.forClass(UsernamePasswordAuthenticationToken.class);
        verify(authenticationManager).authenticate(authenticationCaptor.capture());
        assertThat(authenticationCaptor.getValue().getPrincipal()).isEqualTo("maria@email.com");
        assertThat(authenticationCaptor.getValue().getCredentials()).isEqualTo("123456");
        assertThat(response.token()).isEqualTo("jwt-token");
    }
}
