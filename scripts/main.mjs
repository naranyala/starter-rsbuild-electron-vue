#!/usr/bin/env node

import fs from 'fs';
import { buildElectron } from './build-electron.mjs';
import { buildFrontend } from './build-frontend.mjs';
import { startDevWeb } from './dev-web.mjs';
import { startDevElectron } from './dev-electron.mjs';
import { startElectronApp } from './start.mjs';

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const extraArgs = args.slice(1);

switch (command) {
  case 'build': {
    const shouldPackage = extraArgs.includes('--package');
    buildElectron(shouldPackage);
    break;
  }

  case 'build:frontend':
    buildFrontend();
    break;

  case 'dev':
    startDevElectron();
    break;

  case 'dev:electron':
    startDevElectron();
    break;

  case 'dev:web':
    startDevWeb();
    break;

  case 'start':
    startElectronApp();
    break;

  default:
    console.log('Usage:');
    console.log(
      '  node scripts/main.mjs build              # Build full Electron app'
    );
    console.log(
      '  node scripts/main.mjs build --package    # Build and package Electron app'
    );
    console.log(
      '  node scripts/main.mjs build:frontend     # Build frontend only'
    );
    console.log(
      '  node scripts/main.mjs dev                # Start Electron dev environment'
    );
    console.log(
      '  node scripts/main.mjs dev:electron       # Start Electron dev environment'
    );
    console.log(
      '  node scripts/main.mjs dev:web            # Start web dev server only'
    );
    console.log(
      '  node scripts/main.mjs start              # Start built Electron app'
    );
    process.exit(1);
}