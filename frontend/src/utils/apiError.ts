import type { AxiosError } from 'axios';
import type { ApiError } from '../types/models';

export function getErrorMessage(error: unknown, fallback = 'Não foi possível concluir a operação.') {
  const axiosError = error as AxiosError<ApiError>;
  return (
    axiosError?.response?.data?.message ||
    axiosError?.response?.data?.details?.[0] ||
    axiosError?.message ||
    fallback
  );
}
