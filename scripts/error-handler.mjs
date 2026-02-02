/**
 * Enhanced error handling utilities
 */
export class BuildError extends Error {
  constructor(message, code = 'BUILD_ERROR', details = {}) {
    super(message);
    this.name = 'BuildError';
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ProcessError extends Error {
  constructor(message, exitCode, stdout, stderr) {
    super(message);
    this.name = 'ProcessError';
    this.exitCode = exitCode;
    this.stdout = stdout;
    this.stderr = stderr;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleError(error, logger = null) {
  if (error instanceof ValidationError) {
    logger?.error(`Validation error: ${error.message}`);
    return { handled: true, exitCode: 2 };
  }

  if (error instanceof ProcessError) {
    logger?.error(`Process failed (exit ${error.exitCode}): ${error.message}`);
    return { handled: true, exitCode: error.exitCode };
  }

  if (error instanceof BuildError) {
    logger?.error(`Build error [${error.code}]: ${error.message}`);
    return { handled: true, exitCode: 3 };
  }

  logger?.error(`Unexpected error: ${error.message}`);
  return { handled: true, exitCode: 1 };
}

export function setupGracefulShutdown(cleanup = []) {
  const shutdown = async signal => {
    console.log(`\nReceived ${signal}. Shutting down...`);
    try {
      for (const fn of cleanup) await fn();
      console.log('Cleanup completed.');
      process.exit(0);
    } catch (error) {
      console.error('Cleanup error:', error.message);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('uncaughtException', error => {
    console.error('Uncaught Exception:', error.message);
    process.exit(1);
  });
  process.on('unhandledRejection', reason => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
  });
}
