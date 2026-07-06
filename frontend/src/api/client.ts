import axios from 'axios';
import { clearStoredSession, getStoredToken, SESSION_EXPIRED_EVENT } from '../utils/sessionStorage';

const LOCAL_API_URL = 'http://localhost:8080/api';
const PRODUCTION_API_URL = 'https://sistema-gestao-financeira-bkjf.onrender.com/api';

export const API_TIMEOUT_MS = 12000;

function normalizeApiUrl(url: string) {
  return url.replace(/\/+$/, '');
}

function isLocalhostUrl(url: string) {
  return /(^https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);
}

function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  const hasUnsafeProductionUrl = Boolean(configuredUrl && import.meta.env.PROD && isLocalhostUrl(configuredUrl));

  if (!configuredUrl || hasUnsafeProductionUrl) {
    const fallbackUrl = import.meta.env.PROD ? PRODUCTION_API_URL : LOCAL_API_URL;

    if (import.meta.env.PROD) {
      console.error('[API] VITE_API_URL ausente ou inválida em produção; usando fallback seguro.', {
        configuredUrl: configuredUrl || null,
        fallbackUrl,
      });
    }

    return normalizeApiUrl(fallbackUrl);
  }

  return normalizeApiUrl(configuredUrl);
}

export const API_BASE_URL = resolveApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as { details?: unknown; message?: unknown } | undefined;
      console.error('[API] Requisição falhou.', {
        baseURL: error.config?.baseURL,
        code: error.code,
        method: error.config?.method,
        message: error.message,
        responseDetails: responseData?.details,
        responseMessage: responseData?.message,
        status: error.response?.status,
        timeout: error.config?.timeout,
        url: error.config?.url,
      });
    }

    if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');

      if (!isLoginRequest) {
        clearStoredSession();
        window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));

        if (window.location.pathname.startsWith('/app')) {
          window.location.assign('/login?sessionExpired=1');
        }
      }
    }

    return Promise.reject(error);
  },
);
