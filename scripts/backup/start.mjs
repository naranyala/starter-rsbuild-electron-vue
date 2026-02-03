#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import { checkNodeModules, getElectronPath } from './check-dependencies.mjs';

// Start built Electron app
function startElectronApp() {
  console.log('🎮 Starting Electron app...');

  // Compile TypeScript first
  console.log('🔧 Compiling TypeScript...');
  execSync('npm run build:ts', { stdio: 'inherit' });

  // Check if build directory exists (created by 'bun run build')
  if (!fs.existsSync('./build')) {
    console.error('❌ Build directory does not exist. Please run build first.');
    console.log('💡 Run: bun run build');
    process.exit(1);
  }

  // Check if index.html exists in build directory
  if (!fs.existsSync('./build/index.html')) {
    console.error('❌ Built app not found in build directory.');
    console.log('💡 Run: bun run build');
    process.exit(1);
  }

  checkNodeModules();

  const electronPath = getElectronPath();
  if (!fs.existsSync(electronPath)) {
    console.error('❌ Electron not found. Please install dependencies first.');
    process.exit(1);
  }

  const electronProcess = spawn(
    electronPath,
    ['dist-ts/src/backend/backend.js'],
    {
      stdio: 'inherit',
      env: process.env,
    }
  );

  electronProcess.on('close', code => {
    console.log(`Electron process exited with code ${code}`);
    process.exit(code);
  });

  electronProcess.on('error', err => {
    console.error('Electron process error:', err.message);
  });
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startElectronApp();
}

export { startElectronApp };
