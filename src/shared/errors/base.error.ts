/**
 * Base Error Class for Application
 * Provides consistent error handling across the application
 */

export interface ErrorOptions {
  code?: string;
  details?: Record<string, unknown>;
  cause?: Error;
}

export class BaseError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  public readonly cause?: Error;
  public readonly timestamp: Date;

  constructor(message: string, options: ErrorOptions = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code ?? 'UNKNOWN_ERROR';
    this.details = options.details;
    this.cause = options.cause;
    this.timestamp = new Date();

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}
