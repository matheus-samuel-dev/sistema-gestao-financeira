import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../api/client';
import { AuthProvider } from '../contexts/AuthContext';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('submits demo credentials and persists the authenticated session', async () => {
    vi.spyOn(api, 'post').mockResolvedValue({
      data: {
        token: 'jwt-token',
        user: {
          id: 1,
          name: 'Usuario Demo',
          email: 'demo@financeiro.com',
          accountType: 'BUSINESS',
          themePreference: 'LIGHT',
          createdAt: '2026-06-28T10:00:00Z',
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'demo@financeiro.com',
        password: '123456',
      });
    });
    expect(localStorage.getItem('finance-flow-token')).toBe('jwt-token');
  });

  it('shows a friendly validation message for invalid email', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'email-invalido' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe um e-mail válido.')).toBeInTheDocument();
  });

  it('enables submit as soon as email and password are filled', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    const button = screen.getByRole('button', { name: 'Entrar' });
    expect(button).toBeEnabled();

    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '' } });
    expect(button).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } });
    expect(button).toBeEnabled();
  });
});
