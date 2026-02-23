/**
 * IPC Handler Types and Utilities
 * Type-safe IPC handler definitions
 */

import type { ipcMain, IpcMainInvokeEvent } from 'electron';

/**
 * Result type for IPC operations
 */
export interface IpcResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Success result type
 */
export interface IpcSuccess<T = unknown> {
  success: true;
  data: T;
}

/**
 * Error result type
 */
export interface IpcFailure {
  success: false;
  error: string;
  code?: string;
}

/**
 * IPC Handler function type
 */
export type IpcHandler<TParams = unknown, TResult = unknown> = (
  event: IpcMainInvokeEvent,
  params: TParams
) => Promise<TResult>;

/**
 * IPC Handler registration
 */
export interface IpcHandlerRegistration {
  channel: string;
  handler: IpcHandler;
  validate?: (params: unknown) => boolean;
}

/**
 * Create a success IPC result
 */
export function createSuccessResult<T>(data: T): IpcSuccess<T> {
  return { success: true, data };
}

/**
 * Create a failure IPC result
 */
export function createFailureResult(
  error: string,
  code?: string
): IpcFailure {
  return { success: false, error, code };
}

/**
 * Wrap a handler with error handling
 */
export function withErrorHandling<TParams, TResult>(
  handler: IpcHandler<TParams, TResult>,
  channel: string
): IpcHandler<TParams, IpcResult<TResult>> {
  return async (event, params) => {
    try {
      const result = await handler(event, params);
      return createSuccessResult(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`IPC Error on channel ${channel}:`, errorMessage);
      return createFailureResult(errorMessage, 'IPC_HANDLER_ERROR');
    }
  };
}

/**
 * Register IPC handlers safely
 */
export function registerIpcHandlers(
  ipcMainInstance: typeof ipcMain,
  handlers: IpcHandlerRegistration[]
): void {
  for (const { channel, handler, validate } of handlers) {
    ipcMainInstance.handle(
      channel,
      withErrorHandling(async (event, params) => {
        if (validate && !validate(params)) {
          throw new Error(`Validation failed for channel: ${channel}`);
        }
        return handler(event, params);
      }, channel)
    );
  }
}
