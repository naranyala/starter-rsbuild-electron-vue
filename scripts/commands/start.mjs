#!/usr/bin/env node

/**
 * Start Command
 * Runs the built Electron application
 */

import { spawn } from 'node:child_process';
import { config } from '../core/config.mjs';
import {
  BuildError,
  handleError,
  setupGracefulShutdown,
} from '../core/errors.mjs';
import { logger } from '../core/logger.mjs';
import { createProcessManager, execSyncSafe } from '../utils/exec.mjs';
import { exists } from '../utils/fs.mjs';

const ELECTRON = config.get('binaries.electron');

const processManager = createProcessManager();

/**
 * Start the built Electron application
 */
export async function startApp(_options = {}) {
  const task = logger.taskStart('Starting Application');

  try {
    // Step 1: Compile TypeScript
    logger.info('Compiling TypeScript...');
    const tscResult = execSyncSafe('npm run build:ts', { stdio: 'inherit' });
    if (!tscResult.success) {
      throw BuildError.compilationFailed('TypeScript', {
        exitCode: tscResult.code,
        stderr: tscResult.stderr,
      });
    }

    // Step 2: Validate required files exist
    const requiredFiles = ['./build', './build/index.html', './dist-ts'];

    for (const file of requiredFiles) {
      if (!exists(file)) {
        throw BuildError.missingFile(file);
      }
    }

    // Step 3: Validate Electron exists
    if (!exists(ELECTRON)) {
      throw BuildError.missingDependency('electron');
    }

    // Step 4: Launch Electron
    logger.info('Launching Electron...');

    const electronProcess = spawn(ELECTRON, [config.get('electron.entry')], {
      stdio: 'inherit',
      env: process.env,
    });

    processManager.add(electronProcess);

    // Setup graceful shutdown
    setupGracefulShutdown(
      [() => processManager.killAll()],
      logger.child('shutdown')
    );

    // Handle process events
    electronProcess.on('close', code => {
      logger.info(`Electron exited with code ${code}`);
      process.exit(code);
    });

    electronProcess.on('error', error => {
      logger.error(`Electron process error: ${error.message}`);
      processManager.killAll();
      process.exit(1);
    });

    logger.taskEnd(task, true);

    // Keep process alive
    return new Promise(() => {});
  } catch (error) {
    logger.taskEnd(task, false, error);
    processManager.killAll();
    throw error;
  }
}

/**
 * Start with live reload (for development)
 */
export async function startDevReload(options = {}) {
  logger.warn('Live reload mode not yet implemented');
  return startApp(options);
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const useLiveReload = args.includes('--reload') || args.includes('-r');

  const promise = useLiveReload ? startDevReload() : startApp();

  promise.catch(error => {
    handleError(error, logger);
    process.exit(1);
  });
}
