import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../api/client';
import { DEMO_TOKEN } from '../data/demoSession';
import { AuthProvider } from '../contexts/AuthContext';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  it('persists the demo session locally without calling the API', async () => {
    const postSpy = vi.spyOn(api, 'post');

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(localStorage.getItem('finance-flow-token')).toBe(DEMO_TOKEN);
    });
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('submits non-demo credentials to the API with an abort signal', async () => {
    vi.spyOn(api, 'post').mockResolvedValue({
      data: {
        token: 'jwt-token',
        user: {
          id: 2,
          name: 'Usuario Real',
          email: 'usuario@financeiro.com',
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

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'usuario@financeiro.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'usuario@financeiro.com',
        password: '123456',
      }, expect.objectContaining({ signal: expect.any(Object) }));
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

  it('shows a credential error and restores the button for a wrong demo password', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha-errada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('E-mail ou senha inválidos. Confira os dados e tente novamente.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled();
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

  it('shows a friendly message and restores the button when non-demo login times out', async () => {
    vi.spyOn(api, 'post').mockRejectedValue(new AxiosError('timeout of 12000ms exceeded', 'ECONNABORTED'));

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'usuario@financeiro.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('O login demorou mais que o esperado. Verifique sua conexão e tente novamente.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled();
  });
});
