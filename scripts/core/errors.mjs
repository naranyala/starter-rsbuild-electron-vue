#!/usr/bin/env node

/**
 * Core Error Classes
 * Provides structured error handling with codes, context, and recovery hints
 */

export class ScriptError extends Error {
  constructor(message, code, details = {}, recoverable = false) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.recoverable = recoverable;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      recoverable: this.recoverable,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

export class BuildError extends ScriptError {
  constructor(message, code = 'BUILD_ERROR', details = {}) {
    super(message, code, details, false);
  }

  static missingDependency(dep) {
    return new BuildError(
      `Missing required dependency: ${dep}`,
      'MISSING_DEPENDENCY',
      { dependency: dep, hint: `Run: npm install ${dep}` }
    );
  }

  static missingFile(path) {
    return new BuildError(`Required file not found: ${path}`, 'MISSING_FILE', {
      path,
      hint: 'Ensure previous build steps completed successfully',
    });
  }

  static compilationFailed(lang, details) {
    return new BuildError(`${lang} compilation failed`, 'COMPILATION_FAILED', {
      language: lang,
      ...details,
    });
  }
}

export class ValidationError extends ScriptError {
  constructor(message, field = null, code = 'VALIDATION_ERROR') {
    super(message, code, { field }, true);
    this.field = field;
  }

  static invalidPort(port) {
    return new ValidationError(
      `Invalid port: ${port}. Must be between 1024 and 65535`,
      'port',
      'INVALID_PORT'
    );
  }

  static invalidPath(path, reason) {
    return new ValidationError(
      `Invalid path: ${path}. ${reason}`,
      'path',
      'INVALID_PATH'
    );
  }

  static missingOption(option) {
    return new ValidationError(
      `Required option missing: ${option}`,
      option,
      'MISSING_OPTION'
    );
  }
}

export class ProcessError extends ScriptError {
  constructor(message, exitCode, stdout = '', stderr = '', cmd = '') {
    super(
      message,
      'PROCESS_ERROR',
      {
        exitCode,
        stdout: stdout.slice(0, 1000),
        stderr: stderr.slice(0, 1000),
        command: cmd,
      },
      false
    );
    this.exitCode = exitCode;
    this.stdout = stdout;
    this.stderr = stderr;
    this.command = cmd;
  }

  static fromExecError(error, cmd) {
    return new ProcessError(
      `Command failed: ${cmd}`,
      error.status || 1,
      error.stdout || '',
      error.stderr || error.message,
      cmd
    );
  }
}

export class NetworkError extends ScriptError {
  constructor(message, code = 'NETWORK_ERROR', details = {}) {
    super(message, code, details, true);
  }

  static portUnavailable(port, attempts) {
    return new NetworkError(
      `Could not find available port after ${attempts} attempts (tried: ${port})`,
      'PORT_UNAVAILABLE',
      { port, attempts, hint: 'Try specifying a different port range' }
    );
  }

  static connectionFailed(url, error) {
    return new NetworkError(
      `Failed to connect to ${url}`,
      'CONNECTION_FAILED',
      { url, error: error.message }
    );
  }
}

export class FileSystemError extends ScriptError {
  constructor(message, code = 'FS_ERROR', details = {}) {
    super(message, code, details, true);
  }

  static readFailed(path, error) {
    return new FileSystemError(`Failed to read file: ${path}`, 'READ_FAILED', {
      path,
      error: error.message,
    });
  }

  static writeFailed(path, error) {
    return new FileSystemError(
      `Failed to write file: ${path}`,
      'WRITE_FAILED',
      { path, error: error.message }
    );
  }

  static copyFailed(src, dest, error) {
    return new FileSystemError(
      `Failed to copy ${src} to ${dest}`,
      'COPY_FAILED',
      { source: src, destination: dest, error: error.message }
    );
  }
}

/**
 * Global error handler with context-aware logging
 */
export function handleError(error, logger = null) {
  const result = {
    handled: true,
    exitCode: 1,
    error: null,
    hint: null,
  };

  if (error instanceof ScriptError) {
    result.error = error;
    result.hint = error.details?.hint || null;

    if (error instanceof ValidationError) {
      logger?.error(`Validation error: ${error.message}`);
      result.exitCode = 2;
    } else if (error instanceof BuildError) {
      logger?.error(`Build error [${error.code}]: ${error.message}`);
      result.exitCode = 3;
    } else if (error instanceof ProcessError) {
      logger?.error(
        `Process failed [exit ${error.exitCode}]: ${error.message}`
      );
      if (error.stderr) {
        logger?.debug(`stderr: ${error.stderr.slice(0, 500)}`);
      }
      result.exitCode = error.exitCode || 4;
    } else if (error instanceof NetworkError) {
      logger?.error(`Network error [${error.code}]: ${error.message}`);
      result.exitCode = 5;
    } else if (error instanceof FileSystemError) {
      logger?.error(`File system error [${error.code}]: ${error.message}`);
      result.exitCode = 6;
    }

    if (result.hint && logger) {
      logger.info(`Hint: ${result.hint}`);
    }
  } else {
    logger?.error(`Unexpected error: ${error.message}`);
    logger?.debug(error.stack);
    result.error = error;
  }

  return result;
}

/**
 * Async error wrapper - wraps async functions with error handling
 */
export function withErrorHandling(fn, logger = null) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const result = handleError(error, logger);
      return { success: false, ...result };
    }
  };
}

/**
 * Setup graceful shutdown with cleanup handlers
 */
export function setupGracefulShutdown(cleanupHandlers = [], logger = null) {
  let isShuttingDown = false;

  const shutdown = async signal => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger?.info(`\nReceived ${signal}. Shutting down gracefully...`);

    const cleanupPromises = cleanupHandlers.map(async (handler, index) => {
      try {
        await handler();
        return { index, success: true };
      } catch (error) {
        logger?.error(`Cleanup handler ${index} failed: ${error.message}`);
        return { index, success: false, error };
      }
    });

    const results = await Promise.allSettled(cleanupPromises);
    const failed = results.filter(
      r => r.status === 'rejected' || !r.value?.success
    );

    if (failed.length > 0) {
      logger?.error(`Cleanup completed with ${failed.length} failures`);
      process.exit(1);
    } else {
      logger?.success('Cleanup completed successfully');
      process.exit(0);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('uncaughtException', error => {
    logger?.error(`Uncaught Exception: ${error.message}`);
    logger?.debug(error.stack);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', reason => {
    logger?.error(`Unhandled Rejection: ${reason}`);
    shutdown('unhandledRejection');
  });

  return { shutdown };
}

/**
 * Assert helper that throws ValidationError
 */
export function assert(condition, message, field = null) {
  if (!condition) {
    throw new ValidationError(message, field);
  }
}
