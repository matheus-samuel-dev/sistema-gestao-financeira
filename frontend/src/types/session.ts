import type { AccountType, AuthResponse, ThemePreference, UserProfile } from './models';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  accountType: AccountType;
}

export type { AuthResponse, ThemePreference, UserProfile };
