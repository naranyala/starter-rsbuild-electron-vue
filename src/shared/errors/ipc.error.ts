/**
 * IPC-related Errors
 */

import { BaseError } from './base.error';

export class IPCError extends BaseError {
  constructor(
    message: string,
    channel?: string,
    details?: Record<string, unknown>
  ) {
    super(message, {
      code: 'IPC_ERROR',
      details: { ...details, channel },
    });
    this.name = 'IPCError';
  }
}

export class IPCChannelNotFoundError extends IPCError {
  constructor(channel: string) {
    super(`IPC channel not found: ${channel}`, channel);
    this.name = 'IPCChannelNotFoundError';
  }
}

export class IPCValidationError extends IPCError {
  constructor(
    channel: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(`IPC validation failed: ${message}`, channel, details);
    this.name = 'IPCValidationError';
  }
}

export class IPCTimeoutError extends IPCError {
  constructor(channel: string, timeout: number) {
    super(`IPC request timed out after ${timeout}ms`, channel);
    this.name = 'IPCTimeoutError';
  }
}
