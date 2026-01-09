/**
 * HTTP Client Helper - Safe HTTP client wrapper using axios
 *
 * @description Provides a secure HTTP client that replaces dangerous shell exec calls
 * with proper axios requests. Includes timeout, retry, and error handling.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * HTTP Client configuration
 */
export interface HttpClientConfig {
  /** Request timeout in milliseconds */
  timeout: number;
  /** Maximum number of retries */
  maxRetries: number;
  /** Base delay between retries in milliseconds */
  retryDelay: number;
  /** Maximum content length in bytes */
  maxContentLength: number;
}

/**
 * Default HTTP client configuration
 */
const DEFAULT_CONFIG: HttpClientConfig = {
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000,
  maxContentLength: 50 * 1024 * 1024 // 50MB
};

/**
 * Create a configured axios instance
 *
 * @param config - Optional configuration overrides
 * @returns Configured axios instance
 */
export function createHttpClient(config: Partial<HttpClientConfig> = {}): AxiosInstance {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const instance = axios.create({
    timeout: finalConfig.timeout,
    maxContentLength: finalConfig.maxContentLength,
    validateStatus: (status) => status >= 200 && status < 500
  });

  // Add response interceptor for logging
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('[HttpClient] Request failed:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message
      });
      throw error;
    }
  );

  return instance;
}

/**
 * Safe HTTP GET request with retry logic
 *
 * @param url - Request URL
 * @param headers - Request headers
 * @param config - Optional configuration
 * @returns Promise with response data
 */
export async function safeHttpGet<T>(
  url: string,
  headers: Record<string, string | number> = {},
  config: Partial<HttpClientConfig> = {}
): Promise<{ success: boolean; data: T | null; status: number; error?: string }> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const client = createHttpClient(finalConfig);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      const response = await client.get<T>(url, { headers });

      return {
        success: response.status >= 200 && response.status < 300,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < finalConfig.maxRetries) {
        await sleep(finalConfig.retryDelay * attempt);
      }
    }
  }

  return {
    success: false,
    data: null,
    status: 0,
    error: lastError?.message || 'Request failed after all retries'
  };
}

/**
 * Safe HTTP POST request with retry logic
 *
 * @param url - Request URL
 * @param data - Request body
 * @param headers - Request headers
 * @param config - Optional configuration
 * @returns Promise with response data
 */
export async function safeHttpPost<T, D = unknown>(
  url: string,
  data: D,
  headers: Record<string, string | number> = {},
  config: Partial<HttpClientConfig> = {}
): Promise<{ success: boolean; data: T | null; status: number; error?: string }> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const client = createHttpClient(finalConfig);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      const response = await client.post<T>(url, data, { headers });

      return {
        success: response.status >= 200 && response.status < 300,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < finalConfig.maxRetries) {
        await sleep(finalConfig.retryDelay * attempt);
      }
    }
  }

  return {
    success: false,
    data: null,
    status: 0,
    error: lastError?.message || 'Request failed after all retries'
  };
}

/**
 * Sleep helper function
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sanitize URL to prevent injection attacks
 *
 * @param url - URL to sanitize
 * @returns Sanitized URL
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    throw new Error('Invalid URL provided');
  }
}

/**
 * Sanitize headers to prevent injection
 *
 * @param headers - Headers object to sanitize
 * @returns Sanitized headers
 */
export function sanitizeHeaders(headers: Record<string, unknown>): Record<string, string | number> {
  const sanitized: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(headers)) {
    // Only allow safe header names (alphanumeric, hyphens, underscores)
    if (!/^[\w-]+$/.test(key)) {
      console.warn(`[HttpClient] Skipping invalid header name: ${key}`);
      continue;
    }

    // Only allow string or number values
    if (typeof value === 'string' || typeof value === 'number') {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
