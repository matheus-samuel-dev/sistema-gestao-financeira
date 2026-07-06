import { AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './client';

describe('api client', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('clears session and emits an event when API returns 401', async () => {
    const listener = vi.fn();
    const config: InternalAxiosRequestConfig = { url: '/dashboard', headers: new AxiosHeaders() };
    const response = {
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config,
      data: { message: 'Sessão expirada.' },
    } as AxiosResponse;

    localStorage.setItem('finance-flow-token', 'expired-token');
    localStorage.setItem('finance-flow-user', JSON.stringify({ id: 1 }));
    window.addEventListener('finance-flow-session-expired', listener);

    await expect(api.get('/dashboard', {
      adapter: () => Promise.reject(new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, response)),
    })).rejects.toBeInstanceOf(AxiosError);

    expect(localStorage.getItem('finance-flow-token')).toBeNull();
    expect(localStorage.getItem('finance-flow-user')).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener('finance-flow-session-expired', listener);
  });
});
