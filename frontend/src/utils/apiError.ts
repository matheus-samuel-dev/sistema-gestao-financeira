import axios, { type AxiosError } from 'axios';
import { isDemoInvalidCredentialsError } from '../data/demoSession';
import type { ApiError } from '../types/models';

export function getErrorMessage(error: unknown, fallback = 'Não foi possível concluir a operação.') {
  const axiosError = error as AxiosError<ApiError>;
  return axiosError?.response?.data?.message || axiosError?.response?.data?.details?.[0] || fallback;
}

function isTimeoutOrCanceled(error: AxiosError<ApiError>) {
  return error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.code === 'ERR_CANCELED';
}

export function getLoginErrorMessage(error: unknown) {
  if (isDemoInvalidCredentialsError(error)) {
    return 'E-mail ou senha inválidos. Confira os dados e tente novamente.';
  }

  if (!axios.isAxiosError<ApiError>(error)) {
    return 'Não foi possível entrar agora. Tente novamente em instantes.';
  }

  if (isTimeoutOrCanceled(error)) {
    return 'O login demorou mais que o esperado. Verifique sua conexão e tente novamente.';
  }

  if (!error.response) {
    return 'Não conseguimos conectar ao servidor agora. Tente novamente em instantes.';
  }

  if (error.response.status === 401 || error.response.status === 403) {
    return 'E-mail ou senha inválidos. Confira os dados e tente novamente.';
  }

  if (error.response.status >= 500) {
    return 'O servidor não conseguiu responder agora. Tente novamente em instantes.';
  }

  return 'Não foi possível entrar agora. Tente novamente em instantes.';
}

export function getApiDebugInfo(error: unknown) {
  if (isDemoInvalidCredentialsError(error)) {
    return { code: 'DEMO_INVALID_CREDENTIALS', message: 'Credenciais demo inválidas.' };
  }

  if (!axios.isAxiosError<ApiError>(error)) {
    return { message: error instanceof Error ? error.message : String(error) };
  }

  return {
    baseURL: error.config?.baseURL,
    code: error.code,
    method: error.config?.method,
    message: error.message,
    responseDetails: error.response?.data?.details,
    responseMessage: error.response?.data?.message,
    status: error.response?.status,
    timeout: error.config?.timeout,
    url: error.config?.url,
  };
}
