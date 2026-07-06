import axios from 'axios';
import { clearStoredSession, getStoredToken, SESSION_EXPIRED_EVENT } from '../utils/sessionStorage';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export const api = axios.create({
  baseURL,
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
