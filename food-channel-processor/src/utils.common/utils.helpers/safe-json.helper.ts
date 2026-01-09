/**
 * Safe JSON Helper - Utility functions for safe JSON parsing and stringifying
 *
 * @description Provides safe wrappers around JSON.parse and JSON.stringify to prevent
 * runtime errors and provide consistent error handling across the application.
 */

export interface SafeParseResult<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

/**
 * Safely parse a JSON string with error handling
 *
 * @param jsonString - The JSON string to parse
 * @param defaultValue - Default value to return if parsing fails
 * @returns The parsed object or the default value
 *
 * @example
 * const data = safeJsonParse<UserData>(jsonString, { name: '', age: 0 });
 */
export function safeJsonParse<T>(jsonString: string | null | undefined, defaultValue: T): T {
  if (!jsonString || typeof jsonString !== 'string') {
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(jsonString);
    return parsed as T;
  } catch (error) {
    console.error(`[SafeJsonParse] Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return defaultValue;
  }
}

/**
 * Safely parse a JSON string with detailed result
 *
 * @param jsonString - The JSON string to parse
 * @returns Object containing success status, parsed data, and error message
 *
 * @example
 * const result = safeJsonParseWithResult<UserData>(jsonString);
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 */
export function safeJsonParseWithResult<T>(jsonString: string | null | undefined): SafeParseResult<T> {
  if (!jsonString || typeof jsonString !== 'string') {
    return {
      success: false,
      data: null,
      error: 'Input is null, undefined, or not a string'
    };
  }

  try {
    const parsed = JSON.parse(jsonString);
    return {
      success: true,
      data: parsed as T,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown parse error'
    };
  }
}

/**
 * Safely stringify an object with error handling
 *
 * @param obj - The object to stringify
 * @param defaultValue - Default value to return if stringifying fails
 * @returns The JSON string or the default value
 *
 * @example
 * const jsonStr = safeJsonStringify(userData, '{}');
 */
export function safeJsonStringify(obj: unknown, defaultValue: string = '{}'): string {
  if (obj === undefined || obj === null) {
    return defaultValue;
  }

  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.error(`[SafeJsonStringify] Failed to stringify: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return defaultValue;
  }
}

/**
 * Parse JSON array safely
 *
 * @param jsonString - The JSON string to parse as array
 * @returns The parsed array or empty array
 *
 * @example
 * const items = safeJsonParseArray<Item>(jsonString);
 */
export function safeJsonParseArray<T>(jsonString: string | null | undefined): T[] {
  const result = safeJsonParse<T[]>(jsonString, []);
  return Array.isArray(result) ? result : [];
}
