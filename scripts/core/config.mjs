#!/usr/bin/env node

/**
 * Configuration Management
 * Centralized config with environment detection and validation
 */

import { ValidationError } from './errors.mjs';
import { logger } from './logger.mjs';

// Default configuration
const DEFAULT_CONFIG = {
  // Build settings
  build: {
    mode: 'production',
    clean: true,
    sourceMap: false,
    minify: true,
    target: 'es2022',
  },

  // Development settings
  dev: {
    port: 3000,
    host: 'localhost',
    hmr: true,
    open: false,
  },

  // Electron settings
  electron: {
    entry: 'dist-ts/src/main.js',
    devEntry: 'dist-ts/src/main-dev.js',
    preload: 'src/preload.js',
    distPreload: 'dist-ts/preload.js',
  },

  // Paths
  paths: {
    src: './src',
    build: './build',
    dist: './dist',
    distTs: './dist-ts',
    nodeModules: './node_modules',
  },

  // Binaries
  binaries: {
    rsbuild: './node_modules/.bin/rsbuild',
    electron: './node_modules/.bin/electron',
    builder: './node_modules/.bin/electron-builder',
    tsc: './node_modules/.bin/tsc',
  },

  // Environment variables for Electron on Linux/KDE
  env: {
    KDE_DISABLE_WIDGET_ANTIALIASING: '1',
    NO_AT_BRIDGE: '1',
    QTWEBENGINE_DISABLE_SANDBOX: '1',
    ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    QT_QPA_PLATFORM: 'xcb',
    KIO_DISABLE_CACHE: '1',
    KDE_SESSION_VERSION: '5',
    DESKTOP_SESSION: 'plasma',
    QT_AUTO_SCREEN_SCALE_FACTOR: '0',
    QT_SCALE_FACTOR: '1',
    GTK_THEME: 'Adwaita:dark',
    ELECTRON_FORCE_WINDOW_MENU_BAR: '1',
  },

  // Network settings
  network: {
    portMin: 3000,
    portMax: 9999,
    portAttempts: 100,
    timeout: 30000,
  },

  // Logging
  log: {
    level: 'INFO',
    timestamps: true,
    colors: true,
  },
};

class ConfigManager {
  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  loadConfig() {
    // Start with defaults
    const config = structuredClone(DEFAULT_CONFIG);

    // Override with environment variables
    if (process.env.NODE_ENV) {
      config.build.mode =
        process.env.NODE_ENV === 'development' ? 'development' : 'production';
    }
    if (process.env.LOG_LEVEL) {
      config.log.level = process.env.LOG_LEVEL;
    }
    if (process.env.DEV_PORT) {
      config.dev.port = parseInt(process.env.DEV_PORT, 10);
    }

    // Override with CLI args if provided (store for later application)
    this.cliOverrides = this.parseCliArgs();

    // Try to load local config file if exists
    try {
      const localConfig = this.loadLocalConfig();
      if (localConfig) {
        this.deepMerge(config, localConfig);
      }
    } catch (error) {
      logger.debug(`Could not load local config: ${error.message}`);
    }

    return config;
  }

  parseCliArgs() {
    const overrides = {};
    for (const arg of process.argv.slice(2)) {
      if (arg.startsWith('--mode=')) {
        overrides.build = { mode: arg.split('=')[1] };
      } else if (arg.startsWith('--port=')) {
        overrides.dev = { port: parseInt(arg.split('=')[1], 10) };
      } else if (arg === '--no-clean') {
        overrides.build = { clean: false };
      } else if (arg.startsWith('--log-level=')) {
        overrides.log = { level: arg.split('=')[1] };
      }
    }
    return overrides;
  }

  loadLocalConfig() {
    const fs = import('node:fs').then(m => m.default);
    return fs.then(f => {
      if (f.existsSync('./build.config.js')) {
        return import('../../build.config.js').then(m => m.default || m);
      }
      if (f.existsSync('./build.config.mjs')) {
        return import('../../build.config.mjs').then(m => m.default || m);
      }
      return null;
    });
  }

  deepMerge(target, source) {
    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        if (!target[key]) target[key] = {};
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  validateConfig() {
    const { port } = this.config.dev;
    if (port < 1024 || port > 65535) {
      throw ValidationError.invalidPort(port);
    }

    const { mode } = this.config.build;
    if (!['development', 'production', 'dev', 'prod'].includes(mode)) {
      throw new ValidationError(
        `Invalid build mode: ${mode}. Must be 'development' or 'production'`,
        'build.mode'
      );
    }

    // Normalize mode
    this.config.build.mode =
      mode === 'dev' ? 'development' : mode === 'prod' ? 'production' : mode;
  }

  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config);
  }

  set(path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!obj[key]) obj[key] = {};
      return obj[key];
    }, this.config);
    target[last] = value;
  }

  merge(overrides) {
    this.deepMerge(this.config, overrides);
    this.validateConfig();
  }

  // Get environment variables for Electron
  getElectronEnv(extraEnv = {}) {
    return {
      ...process.env,
      ...this.config.env,
      ...extraEnv,
    };
  }

  // Get build environment
  getBuildEnv() {
    return {
      ...process.env,
      NODE_ENV: this.config.build.mode,
    };
  }

  // Get development environment
  getDevEnv() {
    return {
      ...process.env,
      ...this.config.env,
      NODE_ENV: 'development',
    };
  }

  // Create derived paths
  async resolve(...segments) {
    const path = await import('node:path');
    return path.resolve(...segments);
  }

  // Check if in development mode
  isDev() {
    return this.config.build.mode === 'development';
  }

  // Check if in production mode
  isProd() {
    return this.config.build.mode === 'production';
  }

  // Get all config as plain object
  toJSON() {
    return structuredClone(this.config);
  }
}

// Export singleton instance
export const config = new ConfigManager();

// Export for testing
export { ConfigManager, DEFAULT_CONFIG };
