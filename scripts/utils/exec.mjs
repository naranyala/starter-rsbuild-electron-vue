#!/usr/bin/env node

/**
 * Process Execution Utilities
 * Safe command execution with proper error handling and output capture
 */

import { execSync, spawn } from 'node:child_process';
import { ProcessError } from '../core/errors.mjs';
import { logger } from '../core/logger.mjs';

/**
 * Execute command synchronously with error handling
 */
export function execSyncSafe(command, options = {}) {
  const { log = true, ...execOptions } = options;

  try {
    if (log) logger.debug(`Executing: ${command}`);

    const result = execSync(command, {
      encoding: 'utf8',
      stdio: log ? 'inherit' : 'pipe',
      ...execOptions,
    });

    return {
      success: true,
      code: 0,
      stdout: result || '',
      stderr: '',
    };
  } catch (error) {
    return {
      success: false,
      code: error.status || 1,
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
      error,
    };
  }
}

/**
 * Execute command synchronously, throws on failure
 */
export function execSyncOrFail(command, options = {}) {
  const result = execSyncSafe(command, { log: false, ...options });

  if (!result.success) {
    throw ProcessError.fromExecError(
      result.error || new Error(result.stderr),
      command
    );
  }

  return result.stdout;
}

/**
 * Execute command asynchronously with streaming output
 */
export function execAsync(command, args = [], options = {}) {
  const {
    cwd = process.cwd(),
    env = process.env,
    stdio = 'inherit',
    onStdout,
    onStderr,
    onError,
    timeout,
    ...spawnOptions
  } = options;

  return new Promise((resolve, reject) => {
    logger.debug(`Spawning: ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      cwd,
      env,
      stdio: stdio === 'inherit' ? 'inherit' : 'pipe',
      ...spawnOptions,
    });

    let stdout = '';
    let stderr = '';
    let timeoutId;

    if (timeout) {
      timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        reject(
          new ProcessError(
            `Command timed out after ${timeout}ms`,
            -1,
            stdout,
            stderr,
            `${command} ${args.join(' ')}`
          )
        );
      }, timeout);
    }

    if (child.stdout && stdio !== 'inherit') {
      child.stdout.on('data', data => {
        const chunk = data.toString();
        stdout += chunk;
        onStdout?.(chunk);
      });
    }

    if (child.stderr && stdio !== 'inherit') {
      child.stderr.on('data', data => {
        const chunk = data.toString();
        stderr += chunk;
        onStderr?.(chunk);
      });
    }

    child.on('error', error => {
      clearTimeout(timeoutId);
      onError?.(error);
      reject(ProcessError.fromExecError(error, `${command} ${args.join(' ')}`));
    });

    child.on('close', code => {
      clearTimeout(timeoutId);

      if (code === 0) {
        resolve({
          success: true,
          code: 0,
          stdout,
          stderr,
          child,
        });
      } else {
        reject(
          new ProcessError(
            `Command failed with exit code ${code}`,
            code,
            stdout,
            stderr,
            `${command} ${args.join(' ')}`
          )
        );
      }
    });
  });
}

/**
 * Run npm script
 */
export function npm(script, options = {}) {
  return execAsync('npm', ['run', script], options);
}

/**
 * Run npx command
 */
export function npx(command, args = [], options = {}) {
  return execAsync('npx', [command, ...args], options);
}

/**
 * Check if a command exists in PATH
 */
export function commandExists(command) {
  try {
    execSyncSafe(`which ${command}`, { log: false, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get command output as string
 */
export function getOutput(command, args = [], options = {}) {
  return execAsync(command, args, { stdio: 'pipe', ...options })
    .then(result => result.stdout.trim())
    .catch(() => '');
}

/**
 * Kill process by PID
 */
export function kill(pid, signal = 'SIGTERM') {
  try {
    process.kill(pid, signal);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a process manager for long-running processes
 */
export function createProcessManager() {
  const processes = new Set();

  return {
    add(child) {
      processes.add(child);

      child.on('close', () => {
        processes.delete(child);
      });

      child.on('error', () => {
        processes.delete(child);
      });

      return child;
    },

    async killAll(signal = 'SIGTERM', timeout = 5000) {
      const kills = Array.from(processes).map(child => {
        return new Promise(resolve => {
          if (child.killed || child.exitCode !== null) {
            resolve();
            return;
          }

          child.kill(signal);

          const timer = setTimeout(() => {
            if (!child.killed) {
              child.kill('SIGKILL');
            }
            resolve();
          }, timeout);

          child.on('close', () => {
            clearTimeout(timer);
            resolve();
          });
        });
      });

      await Promise.all(kills);
      processes.clear();
    },

    get count() {
      return processes.size;
    },
  };
}

/**
 * Wait for process to exit
 */
export function waitForExit(child, timeout = null) {
  return new Promise((resolve, reject) => {
    let timeoutId;

    if (timeout) {
      timeoutId = setTimeout(() => {
        reject(
          new ProcessError(
            `Timeout waiting for process to exit`,
            -1,
            '',
            '',
            'waitForExit'
          )
        );
      }, timeout);
    }

    child.on('close', code => {
      clearTimeout(timeoutId);
      resolve(code);
    });

    child.on('error', error => {
      clearTimeout(timeoutId);
      reject(error);
    });
  });
}

// Export all as default object
export default {
  execSyncSafe,
  execSyncOrFail,
  execAsync,
  npm,
  npx,
  commandExists,
  getOutput,
  kill,
  createProcessManager,
  waitForExit,
};
