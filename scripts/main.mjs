#!/usr/bin/env node

/**
 * Unified CLI entry point for all build and development scripts
 */
import { build, buildFrontend } from './build.mjs';
import { startDevElectron, startDevWeb } from './dev.mjs';
import { handleError, setupGracefulShutdown } from './error-handler.mjs';
import { logger } from './logger.mjs';
import { startApp } from './start.mjs';

const HELP = `
${'='.repeat(60)}
Electron + Vue + Rsbuild Build Tool
${'='.repeat(60)}

Usage: node scripts/main.mjs <command> [options]

Commands:
  dev, dev:electron     Start Electron development environment
  dev:web               Start web development server only
  build                 Build full Electron app (frontend + electron)
  build:frontend        Build frontend only
  dist                  Build and package for distribution
  start                 Start built Electron application
  help                  Show this help message

Options:
  --mode=<dev|prod>     Build mode (default: production)
  --package             Package with electron-builder
  --port=<number>       Dev server port (default: 3000)
  --no-clean            Don't clean previous build

Examples:
  node scripts/main.mjs dev
  node scripts/main.mjs dev:web --port=4000
  node scripts/main.mjs build
  node scripts/main.mjs dist --package
  node scripts/main.mjs start

${'='.repeat(60)}
`;

function parseArgs(args) {
  const opts = { mode: 'production', package: false, port: null, clean: true };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') return { help: true };
    if (arg === '--package') opts.package = true;
    if (arg === '--no-clean') opts.clean = false;
    if (arg.startsWith('--mode=')) opts.mode = arg.split('=')[1];
    if (arg.startsWith('--port=')) opts.port = parseInt(arg.split('=')[1]);
  }

  return opts;
}

const COMMANDS = {
  help: () => {
    console.log(HELP);
    return true;
  },
  'dev:web': async o => startDevWeb({ port: o.port || 3000 }),
  dev: startDevElectron,
  'dev:electron': startDevElectron,
  build: async o => build({ mode: o.mode, package: o.package, clean: o.clean }),
  'build:frontend': async o => buildFrontend({ mode: o.mode, clean: o.clean }),
  dist: async o => build({ mode: 'production', package: true, clean: true }),
  start: async () => startApp(),
};

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const opts = parseArgs(args.slice(1));

  if (!cmd || opts.help) {
    console.log(HELP);
    return true;
  }

  const handler = COMMANDS[cmd];
  if (!handler) {
    logger.error(`Unknown command: ${cmd}`);
    console.log(`\nRun "node scripts/main.mjs help" for available commands.\n`);
    return false;
  }

  try {
    const result = await handler(opts);
    return result?.success !== false;
  } catch (e) {
    handleError(e, logger);
    return false;
  }
}

setupGracefulShutdown([]);

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(s => process.exit(s ? 0 : 1))
    .catch(e => {
      handleError(e, logger);
      process.exit(1);
    });
}

export { main, HELP };
