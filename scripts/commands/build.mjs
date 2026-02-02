#!/usr/bin/env node

/**
 * Build Commands
 * Handles frontend and Electron builds with proper error handling
 */

import { config } from '../core/config.mjs';
import { BuildError, handleError } from '../core/errors.mjs';
import { logger } from '../core/logger.mjs';
import { execAsync, execSyncSafe } from '../utils/exec.mjs';
import { copy, exists, remove } from '../utils/fs.mjs';
import { validateEnum } from '../utils/validate.mjs';

const RSBUILD = config.get('binaries.rsbuild');
const BUILDER = config.get('binaries.builder');

/**
 * Build frontend only
 */
export async function buildFrontend(options = {}) {
  const task = logger.taskStart('Frontend Build');
  const startTime = Date.now();

  try {
    // Validate mode
    const mode = validateEnum(options.mode || config.get('build.mode'), [
      'development',
      'production',
      'dev',
      'prod',
    ]);

    // Clean previous build if requested
    if (options.clean !== false) {
      logger.info('Cleaning previous build...');
      remove('./build');
    }

    // Run rsbuild
    logger.info(`Building frontend in ${mode} mode...`);
    await execAsync(RSBUILD, ['build', '--config', 'rsbuild.config.ts'], {
      env: { ...process.env, NODE_ENV: mode },
      stdio: 'inherit',
    });

    // Verify output
    if (!exists('./build/index.html')) {
      throw BuildError.missingFile('./build/index.html');
    }

    const duration = Date.now() - startTime;
    logger.taskEnd(task, true);
    logger.success(`Frontend build completed in ${duration}ms`);

    return { success: true, duration, output: './build' };
  } catch (error) {
    logger.taskEnd(task, false, error);
    throw BuildError.compilationFailed('Frontend', { error: error.message });
  }
}

/**
 * Compile TypeScript
 */
export async function compileTypeScript(_options = {}) {
  const task = logger.taskStart('TypeScript Compilation');
  const startTime = Date.now();

  try {
    logger.info('Compiling TypeScript...');

    const tscResult = execSyncSafe('npm run build:ts', { stdio: 'inherit' });
    if (!tscResult.success) {
      throw BuildError.compilationFailed('TypeScript', {
        exitCode: tscResult.code,
        stderr: tscResult.stderr,
      });
    }

    const duration = Date.now() - startTime;
    logger.taskEnd(task, true);
    logger.success(`TypeScript compilation completed in ${duration}ms`);

    return { success: true, duration };
  } catch (error) {
    logger.taskEnd(task, false, error);
    throw error;
  }
}

/**
 * Package with electron-builder
 */
export async function packageElectron(_options = {}) {
  const task = logger.taskStart('Electron Packaging');
  const startTime = Date.now();

  try {
    if (!exists(BUILDER)) {
      throw BuildError.missingDependency('electron-builder');
    }

    logger.info('Packaging with electron-builder...');

    await execAsync(BUILDER, [], {
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: 'inherit',
    });

    // Clean up build directory after packaging
    remove('./build');

    const duration = Date.now() - startTime;
    logger.taskEnd(task, true);
    logger.success(`Packaging completed in ${duration}ms`);
    logger.info('Output: ./dist');

    return { success: true, duration, output: './dist' };
  } catch (error) {
    logger.taskEnd(task, false, error);
    throw BuildError.compilationFailed('Packaging', { error: error.message });
  }
}

/**
 * Full build (frontend + electron + optional packaging)
 */
export async function build(options = {}) {
  const task = logger.taskStart('Full Build');
  const startTime = Date.now();

  try {
    const mode = options.mode || config.get('build.mode');

    // Step 1: Compile TypeScript
    await compileTypeScript(options);

    // Step 2: Build frontend
    await buildFrontend({ ...options, mode });

    // Step 3: Copy additional files
    if (exists('./src/preload.js')) {
      copy('./src/preload.js', './dist-ts/preload.js');
    }

    // Step 4: Package if requested
    if (options.package) {
      await packageElectron(options);
    }

    const duration = Date.now() - startTime;
    logger.taskEnd(task, true);
    logger.success(`Full build completed in ${duration}ms`);

    return {
      success: true,
      duration,
      output: options.package ? './dist' : './build',
    };
  } catch (error) {
    logger.taskEnd(task, false, error);
    throw error;
  }
}

/**
 * Build for distribution (production + packaging)
 */
export async function buildDist(options = {}) {
  return build({
    ...options,
    mode: 'production',
    clean: true,
    package: true,
  });
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0] || 'build';
  const mode =
    args.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'production';
  const shouldPackage = args.includes('--package');
  const noClean = args.includes('--no-clean');

  let promise;

  switch (command) {
    case 'frontend':
      promise = buildFrontend({ mode, clean: !noClean });
      break;
    case 'ts':
    case 'typescript':
      promise = compileTypeScript();
      break;
    case 'package':
      promise = packageElectron();
      break;
    case 'dist':
      promise = buildDist();
      break;
    default:
      promise = build({ mode, package: shouldPackage, clean: !noClean });
  }

  promise
    .then(() => process.exit(0))
    .catch(error => {
      handleError(error, logger);
      process.exit(1);
    });
}
