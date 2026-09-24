export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode?: number;
}
