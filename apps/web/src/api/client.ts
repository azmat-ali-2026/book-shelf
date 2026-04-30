import axios from 'axios';
import type { ApiError } from '../types';

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: { 'Content-Type': 'application/json' },
});

// Pass-through for successful responses; transform errors into typed ApiRequestError.
apiClient.interceptors.response.use(
  undefined,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response !== undefined) {
      const apiError = error.response.data as ApiError;
      throw new ApiRequestError(
        error.response.status,
        apiError.error.code,
        apiError.error.message,
        apiError.error.details,
      );
    }
    throw error;
  },
);
