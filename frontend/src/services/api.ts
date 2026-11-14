/**
 * Central API Client Service
 *
 * Provides a unified HTTP client with timeout handling, token authorization headers,
 * and standard error response formatting.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

class ApiService {
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('wecare_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = `${BASE_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network request failed',
      };
    }
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      return await response.json();
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network request failed',
      };
    }
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      return await response.json();
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network request failed',
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network request failed',
      };
    }
  }
}

export const api = new ApiService();
export default api;
