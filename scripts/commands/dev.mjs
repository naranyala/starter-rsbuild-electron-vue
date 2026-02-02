#!/usr/bin/env node

/**
 * Development Server Commands
 * Handles web and Electron development servers with proper error handling
 */

import { spawn } from 'node:child_process';
import { config } from '../core/config.mjs';
import {
  BuildError,
  handleError,
  setupGracefulShutdown,
} from '../core/errors.mjs';
import { logger } from '../core/logger.mjs';
import {
  createProcessManager,
  execAsync,
  execSyncSafe,
} from '../utils/exec.mjs';
import {
  copy,
  exists,
  findByExtension,
  readFile,
  writeFile,
} from '../utils/fs.mjs';
import { findAvailablePort } from '../utils/network.mjs';
import { validatePort } from '../utils/validate.mjs';

const RSBUILD = config.get('binaries.rsbuild');
const ELECTRON = config.get('binaries.electron');

const processManager = createProcessManager();

/**
 * Fix ES module imports in compiled JS files
 */
async function fixImports(dir) {
  const task = logger.taskStart('Fixing ES module imports');

  try {
    const files = findByExtension(dir, '.js');
    let updated = 0;

    for (const file of files) {
      const content = readFile(file.path);

      // Fix relative imports without extensions
      const importRegex = /from\s+["'](\.[^"']*)["']/g;
      let newContent = content;

      for (const match of content.matchAll(importRegex)) {
        const importPath = match[1];

        // Skip if already has extension
        if (/\.(js|ts|json|mjs)$/.test(importPath)) continue;

        // Check if it's a directory or file
        const _fullPath = file.path.replace(/\/[^/]+$/, '') + importPath;

        // Add .js extension
        newContent = newContent.replace(
          new RegExp(
            `from\\s+["']${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`,
            'g'
          ),
          `from "${importPath}.js"`
        );
        updated++;
      }

      if (newContent !== content) {
        writeFile(file.path, newContent);
      }
    }

    logger.taskEnd(task, true);
    logger.debug(`Fixed imports in ${updated} files`);
    return { success: true, updated };
  } catch (error) {
    logger.taskEnd(task, false, error);
    throw BuildError.compilationFailed('Import fixing', {
      error: error.message,
    });
  }
}

/**
 * Start web development server only
 */
export async function startDevWeb(options = {}) {
  const task = logger.taskStart('Web Dev Server');

  try {
    // Validate dependencies
    if (!exists(RSBUILD)) {
      throw BuildError.missingDependency('rsbuild');
    }

    // Validate and set port
    const port = validatePort(options.port || config.get('dev.port'));
    const host = options.host || config.get('dev.host');

    logger.info(`Starting web dev server on http://${host}:${port}...`);

    // Spawn rsbuild dev server
    const devProcess = spawn(
      RSBUILD,
      ['dev', '--config', 'rsbuild.config.ts', '--port', String(port)],
      {
        env: config.getBuildEnv(),
        stdio: 'inherit',
      }
    );

    processManager.add(devProcess);

    // Setup graceful shutdown
    setupGracefulShutdown(
      [() => processManager.killAll()],
      logger.child('shutdown')
    );

    // Wait indefinitely (server keeps running)
    return new Promise(() => {
      devProcess.on('close', code => {
        process.exit(code);
      });
    });
  } catch (error) {
    logger.taskEnd(task, false, error);
    throw error;
  }
}

/**
 * Start Electron development environment
 */
export async function startDevElectron(options = {}) {
  const task = logger.taskStart('Electron Dev Environment');

  try {
    // Validate dependencies
    if (!exists(RSBUILD)) {
      throw BuildError.missingDependency('rsbuild');
    }
    if (!exists(ELECTRON)) {
      throw BuildError.missingDependency('electron');
    }

    // Find available port
    const port = options.port || (await findAvailablePort(4000, 9999));
    const url = `http://localhost:${port}`;

    logger.info(`Starting dev server on ${url}...`);

    // Start rsbuild dev server
    const devProcess = spawn(
      RSBUILD,
      ['dev', '--config', 'rsbuild.config.ts', '--port', String(port)],
      {
        env: config.getDevEnv(),
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    );

    processManager.add(devProcess);

    // Stream output
    devProcess.stdout?.on('data', data => process.stdout.write(data));
    devProcess.stderr?.on('data', data => process.stderr.write(data));

    // Wait for server to be ready
    logger.debug('Waiting for dev server to be ready...');

    // Give rsbuild time to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Compile TypeScript
    logger.info('Compiling TypeScript...');
    const tscResult = execSyncSafe('npm run build:ts', { stdio: 'inherit' });
    if (!tscResult.success) {
      throw BuildError.compilationFailed('TypeScript', {
        exitCode: tscResult.code,
        stderr: tscResult.stderr,
      });
    }

    // Fix imports in compiled files
    await fixImports('./dist-ts');

    // Ensure dist-ts has package.json
    if (!exists('./dist-ts/package.json')) {
      writeFile(
        './dist-ts/package.json',
        JSON.stringify({ type: 'module' }, null, 2)
      );
    }

    // Copy preload script if exists
    if (exists('./src/preload.js')) {
      copy('./src/preload.js', './dist-ts/preload.js');
    }

    // Launch Electron
    logger.info('Launching Electron...');

    const electronProcess = spawn(ELECTRON, [config.get('electron.devEntry')], {
      env: config.getElectronEnv({
        NODE_ENV: 'development',
        ELECTRON_DEV_SERVER: url,
      }),
      stdio: 'inherit',
    });

    processManager.add(electronProcess);

    // Setup graceful shutdown
    setupGracefulShutdown(
      [() => processManager.killAll()],
      logger.child('shutdown')
    );

    // Handle process exits
    electronProcess.on('close', code => {
      logger.info(`Electron exited with code ${code}`);
      processManager.killAll();
      process.exit(code);
    });

    // Return a promise that never resolves (keeps process alive)
    return new Promise(() => {
      devProcess.on('close', code => {
        processManager.killAll();
        process.exit(code);
      });
    });
  } catch (error) {
    logger.taskEnd(task, false, error);
    processManager.killAll();
    throw error;
  }
}

/**
 * Start development server (auto-detects mode)
 */
export async function startDev(options = {}) {
  const mode = options.mode || 'electron';

  switch (mode) {
    case 'web':
      return startDevWeb(options);
    default:
      return startDevElectron(options);
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const mode = args[0] || 'electron';
  const port = args.find(arg => arg.startsWith('--port='))?.split('=')[1];

  startDev({ mode, port: port ? parseInt(port, 10) : undefined }).catch(
    error => {
      handleError(error, logger);
      process.exit(1);
    }
  );
}
