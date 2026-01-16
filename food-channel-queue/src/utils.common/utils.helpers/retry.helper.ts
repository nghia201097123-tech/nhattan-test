/**
 * Retry Helper - Reusable retry logic with RxJS operators
 *
 * @description Provides standardized retry configurations and operators
 * to eliminate code duplication across services.
 */

import { Observable, timer, throwError } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';

/**
 * Retry configuration options
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Base delay in milliseconds between retries */
  delayMs: number;
  /** Whether to use exponential backoff */
  exponentialBackoff: boolean;
  /** Optional callback on each retry */
  onRetry?: (error: Error, retryCount: number) => void;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delayMs: 1000,
  exponentialBackoff: true,
  onRetry: (error, retryCount) => {
    console.error(`[Retry] Attempt ${retryCount} failed: ${error.message}`);
  }
};

/**
 * Create a retry operator with exponential backoff
 *
 * @param config - Retry configuration options
 * @returns RxJS operators for retry logic
 *
 * @example
 * // Usage in service
 * return this.grpcClient.someMethod(data).pipe(
 *   ...createRetryOperator({ maxRetries: 3, delayMs: 1000 })
 * );
 */
export function createRetryOperator<T>(config: Partial<RetryConfig> = {}): any[] {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };

  return [
    retry({
      count: finalConfig.maxRetries,
      delay: (error, retryCount) => {
        if (finalConfig.onRetry) {
          finalConfig.onRetry(error, retryCount);
        }

        const delay = finalConfig.exponentialBackoff
          ? finalConfig.delayMs * Math.pow(2, retryCount - 1)
          : finalConfig.delayMs;

        return timer(delay);
      }
    }),
    catchError((error) => {
      console.error(`[Retry] All ${finalConfig.maxRetries} retries exhausted:`, error.message);
      return throwError(() => error);
    })
  ];
}

/**
 * Promise-based retry function for non-RxJS code
 *
 * @param fn - Async function to retry
 * @param config - Retry configuration options
 * @returns Promise with the result or throws after all retries exhausted
 *
 * @example
 * const result = await retryAsync(
 *   () => fetchData(),
 *   { maxRetries: 3, delayMs: 1000 }
 * );
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (finalConfig.onRetry) {
        finalConfig.onRetry(lastError, attempt);
      }

      if (attempt < finalConfig.maxRetries) {
        const delay = finalConfig.exponentialBackoff
          ? finalConfig.delayMs * Math.pow(2, attempt - 1)
          : finalConfig.delayMs;

        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('All retries exhausted');
}

/**
 * Sleep helper function
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wrap an async function with automatic retry
 *
 * @param fn - Async function to wrap
 * @param config - Retry configuration options
 * @returns Wrapped function with retry capability
 *
 * @example
 * const fetchWithRetry = withRetry(fetchData, { maxRetries: 3 });
 * const result = await fetchWithRetry(params);
 */
export function withRetry<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  config: Partial<RetryConfig> = {}
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => retryAsync(() => fn(...args), config);
}
