#!/usr/bin/env node

/**
 * Main CLI Entry Point
 * Unified interface for all build and development commands
 */

import {
  build,
  buildDist,
  buildFrontend,
  packageElectron,
} from './commands/build.mjs';
// Import command modules
import { startDevElectron, startDevWeb } from './commands/dev.mjs';
import { startApp } from './commands/start.mjs';
import { config } from './core/config.mjs';
import {
  handleError,
  setupGracefulShutdown,
  ValidationError,
} from './core/errors.mjs';
import { cliLogger, createLogger } from './core/logger.mjs';

const HELP = `
${'='.repeat(60)}
  Electron + Vue + Rsbuild Build Tool
${'='.repeat(60)}

Usage: node scripts/cli.mjs <command> [options]

Commands:
  dev, dev:electron     Start Electron development environment
  dev:web               Start web development server only
  build                 Build full Electron app (frontend + electron)
  build:frontend        Build frontend only
  package               Package with electron-builder
  dist                  Build and package for distribution
  start                 Start built Electron application
  help                  Show this help message

Options:
  --mode=<mode>         Build mode: development|production (default: production)
  --port=<number>       Dev server port (default: 3000 for web, random for electron)
  --package             Package with electron-builder (with build command)
  --no-clean            Don't clean previous build
  --log-level=<level>   Log level: ERROR|WARN|INFO|DEBUG|TRACE (default: INFO)
  --json                Output logs in JSON format

Examples:
  node scripts/cli.mjs dev
  node scripts/cli.mjs dev:web --port=4000
  node scripts/cli.mjs build --mode=development
  node scripts/cli.mjs build --package
  node scripts/cli.mjs dist
  node scripts/cli.mjs start

${'='.repeat(60)}
`;

const VERSION = '2.0.0';

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const options = {
    mode: config.get('build.mode'),
    port: null,
    package: false,
    clean: true,
    logLevel: config.get('log.level'),
    json: false,
    help: false,
    version: false,
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--version' || arg === '-v') {
      options.version = true;
    } else if (arg === '--package') {
      options.package = true;
    } else if (arg === '--no-clean') {
      options.clean = false;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg.startsWith('--mode=')) {
      options.mode = arg.split('=')[1];
    } else if (arg.startsWith('--port=')) {
      options.port = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--log-level=')) {
      options.logLevel = arg.split('=')[1];
    }
  }

  return options;
}

/**
 * Validate parsed arguments
 */
function validateArgs(command, options) {
  if (command && !COMMANDS[command]) {
    throw new ValidationError(
      `Unknown command: ${command}`,
      'command',
      'UNKNOWN_COMMAND'
    );
  }

  if (options.port && (options.port < 1024 || options.port > 65535)) {
    throw new ValidationError(
      `Invalid port: ${options.port}. Must be between 1024 and 65535`,
      'port',
      'INVALID_PORT'
    );
  }

  return true;
}

/**
 * Command registry
 */
const COMMANDS = {
  help: async () => {
    console.log(HELP);
    return { success: true };
  },

  version: async () => {
    console.log(`v${VERSION}`);
    return { success: true };
  },

  'dev:web': async opts => {
    return startDevWeb({
      port: opts.port || config.get('dev.port'),
      host: config.get('dev.host'),
    });
  },

  dev: async opts => {
    return startDevElectron({
      port: opts.port,
    });
  },

  'dev:electron': async opts => {
    return startDevElectron({
      port: opts.port,
    });
  },

  build: async opts => {
    return build({
      mode: opts.mode,
      package: opts.package,
      clean: opts.clean,
    });
  },

  'build:frontend': async opts => {
    return buildFrontend({
      mode: opts.mode,
      clean: opts.clean,
    });
  },

  package: async _opts => {
    return packageElectron();
  },

  dist: async _opts => {
    return buildDist();
  },

  start: async _opts => {
    return startApp();
  },
};

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options = parseArgs(args.slice(1));

  // Configure logger based on options
  const logger = createLogger({
    level: options.logLevel,
    json: options.json,
    timestamps: !options.json,
  });

  // Show help or version
  if (!command || options.help) {
    console.log(HELP);
    return true;
  }

  if (options.version) {
    console.log(`v${VERSION}`);
    return true;
  }

  // Validate arguments
  try {
    validateArgs(command, options);
  } catch (error) {
    handleError(error, logger);
    console.log(`\nRun "node scripts/cli.mjs help" for available commands.\n`);
    return false;
  }

  // Execute command
  const handler = COMMANDS[command];
  if (!handler) {
    logger.error(`Unknown command: ${command}`);
    console.log(`\nRun "node scripts/cli.mjs help" for available commands.\n`);
    return false;
  }

  // Setup graceful shutdown
  setupGracefulShutdown([], logger.child('shutdown'));

  try {
    logger.section(`Command: ${command}`);
    logger.debug(`Options: ${JSON.stringify(options, null, 2)}`);

    const result = await handler(options);
    return result?.success !== false;
  } catch (error) {
    handleError(error, logger);
    return false;
  }
}

// Run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      handleError(error, cliLogger);
      process.exit(1);
    });
}

export { main, parseArgs, validateArgs, COMMANDS, HELP, VERSION };
