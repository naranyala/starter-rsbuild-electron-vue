/**
 * Build system - handles frontend and electron builds
 */

import { BuildError } from './error-handler.mjs';
import { logger } from './logger.mjs';
import { exec, fsUtils, network } from './utils.mjs';

const RSBUILD = './node_modules/.bin/rsbuild';
const BUILDER = './node_modules/.bin/electron-builder';

export class BuildSystem {
  constructor(opts = {}) {
    this.mode = opts.mode || 'production';
    this.clean = opts.clean !== false;
    this.package = opts.package || false;
  }

  async buildFrontend() {
    const start = Date.now();
    logger.taskStart('Frontend build');

    if (this.clean && fsUtils.exists('./build')) {
      logger.info('Cleaning previous build...');
      fsUtils.rm('./build');
    }

    const r = exec.syncOrFail(`${RSBUILD} build --config rsbuild.config.ts`, {
      env: { ...process.env, NODE_ENV: this.mode },
    });

    if (!fsUtils.exists('./build/index.html')) {
      throw new BuildError('Build failed: index.html not found', 'NO_OUTPUT');
    }

    logger.taskComplete('Frontend build', Date.now() - start);
    return true;
  }

  async compileTS() {
    const start = Date.now();
    logger.taskStart('TypeScript compilation');
    exec.syncOrFail('npm run build:ts', { stdio: 'inherit' });
    logger.taskComplete('TypeScript compilation', Date.now() - start);
    return true;
  }

  async package() {
    const start = Date.now();
    logger.taskStart('Electron packaging');
    if (!fsUtils.exists(BUILDER))
      throw new BuildError('electron-builder not found', 'MISSING_BUILDER');

    const r = exec.sync(BUILDER, {
      env: { ...process.env, NODE_ENV: this.mode },
    });
    if (!r.success) throw new BuildError('Packaging failed', 'PACKAGE_FAILED');

    logger.taskComplete('Electron packaging', Date.now() - start);
    fsUtils.rm('./build');
    return true;
  }

  async build() {
    const start = Date.now();

    try {
      await this.compileTS();
      await this.buildFrontend();
      if (this.package) await this.package();

      logger.success(`Build completed in ${Date.now() - start}ms`);
      if (this.package) logger.info('Output: ./dist');
      else logger.info('Output: ./build');
      return { success: true };
    } catch (e) {
      logger.error(`Build failed: ${e.message}`);
      return { success: false, error: e.message };
    }
  }
}

export async function build(opts = {}) {
  const system = new BuildSystem(opts);
  return system.build();
}

export async function buildFrontend(opts = {}) {
  const system = new BuildSystem({ ...opts, package: false });
  return system.buildFrontend();
}
