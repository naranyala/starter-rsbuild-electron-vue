/**
 * Error Handling Module
 * Centralized error classes and utilities
 */

import { BaseError } from './base.error';

export { BaseError, type ErrorOptions } from './base.error';
export {
  IPCError,
  IPCChannelNotFoundError,
  IPCValidationError,
  IPCTimeoutError,
} from './ipc.error';
export {
  ValidationError,
  ConfigurationError,
  FileNotFoundError,
} from './validation.error';

/**
 * Type guard to check if a value is an Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard to check if a value is a BaseError
 */
export function isBaseError(value: unknown): value is BaseError {
  return value instanceof BaseError;
}

/**
 * Safely execute a function and return result or error
 */
export function safeExecute<T, R = unknown>(
  fn: () => T,
  errorHandler?: (error: Error) => R
): { success: true; data: T } | { success: false; error: Error | R } {
  try {
    return { success: true, data: fn() };
  } catch (error) {
    if (errorHandler) {
      return { success: false, error: errorHandler(error as Error) };
    }
    return { success: false, error: error as Error };
  }
}

/**
 * Async version of safeExecute
 */
export async function safeExecuteAsync<T, R = unknown>(
  fn: () => Promise<T>,
  errorHandler?: (error: Error) => R | Promise<R>
): Promise<{ success: true; data: T } | { success: false; error: Error | R }> {
  try {
    return { success: true, data: await fn() };
  } catch (error) {
    if (errorHandler) {
      return { success: false, error: await errorHandler(error as Error) };
    }
    return { success: false, error: error as Error };
  }
}
