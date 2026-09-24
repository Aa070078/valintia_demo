import axios, { type AxiosError } from "axios";
import type { ApiError } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // If token exists in client-side storage, attach it
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("valentia_auth_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const apiError: ApiError = {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred. Please try again.",
      error: error.response?.data?.error,
      code: error.response?.data?.code || error.code,
      errors: error.response?.data?.errors,
    };
    return Promise.reject(apiError);
  }
);
