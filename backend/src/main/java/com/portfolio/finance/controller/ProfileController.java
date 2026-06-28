package com.portfolio.finance.controller;

import com.portfolio.finance.dto.profile.ChangePasswordRequest;
import com.portfolio.finance.dto.profile.UpdateProfileRequest;
import com.portfolio.finance.dto.profile.UserProfileResponse;
import com.portfolio.finance.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Perfil", description = "Perfil do usuário autenticado")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    @Operation(summary = "Consultar perfil")
    public UserProfileResponse getProfile() {
        return profileService.getProfile();
    }

    @PutMapping
    @Operation(summary = "Atualizar perfil")
    public UserProfileResponse updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return profileService.updateProfile(request);
    }

    @PatchMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Alterar senha")
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        profileService.changePassword(request);
    }
}
