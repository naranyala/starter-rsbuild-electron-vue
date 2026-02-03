/**
 * Start script - runs the built Electron app
 */

import { BuildError } from './error-handler.mjs';
import { logger } from './logger.mjs';
import { exec, fsUtils } from './utils.mjs';

const ELECTRON = './node_modules/.bin/electron';

export async function startApp() {
  try {
    logger.info('Starting Electron app...');

    logger.info('Compiling TypeScript...');
    const tsc = exec.sync('npm run build:ts', { stdio: 'inherit' });
    if (!tsc.success)
      throw new BuildError('TypeScript compilation failed', 'TSC_FAILED');

    const required = ['./build', './build/index.html'];
    for (const p of required) {
      if (!fsUtils.exists(p))
        throw new BuildError(`Required file not found: ${p}`, 'MISSING_FILE');
    }

    if (!fsUtils.exists(ELECTRON))
      throw new BuildError('Electron not found', 'MISSING_ELECTRON');

    logger.info('Launching Electron...');

    const { spawn } = await import('child_process');
    const electron = spawn(ELECTRON, ['dist-ts/src/backend/backend.js'], {
      stdio: 'inherit',
      env: process.env,
    });

    electron.on('close', c => process.exit(c));
    electron.on('error', e => {
      logger.error(`Electron error: ${e.message}`);
      process.exit(1);
    });

    return { success: true };
  } catch (e) {
    logger.error(`Start failed: ${e.message}`);
    return { success: false, error: e.message };
  }
}
