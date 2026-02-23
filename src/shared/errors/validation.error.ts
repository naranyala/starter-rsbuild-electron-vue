/**
 * Validation Errors
 */

import { BaseError } from './base.error';

export class ValidationError extends BaseError {
  constructor(
    message: string,
    field?: string,
    details?: Record<string, unknown>
  ) {
    super(message, {
      code: 'VALIDATION_ERROR',
      details: { ...details, field },
    });
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends BaseError {
  constructor(message: string, key?: string) {
    super(message, {
      code: 'CONFIGURATION_ERROR',
      details: { key },
    });
    this.name = 'ConfigurationError';
  }
}

export class FileNotFoundError extends BaseError {
  constructor(filePath: string, cause?: Error) {
    super(`File not found: ${filePath}`, {
      code: 'FILE_NOT_FOUND',
      details: { filePath },
      cause,
    });
    this.name = 'FileNotFoundError';
  }
}
