#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';
import { checkNodeModules, getRsbuildPath } from './check-dependencies.mjs';

// Build frontend only
function buildFrontend() {
  console.log('📦 Building frontend...');

  checkNodeModules();

  const rsbuildPath = getRsbuildPath();
  if (!fs.existsSync(rsbuildPath)) {
    console.error('❌ Rsbuild not found. Please install dependencies first.');
    process.exit(1);
  }

  // Clean previous build
  if (fs.existsSync('./build')) {
    execSync('rm -rf build/', { stdio: 'inherit' });
  }

  execSync(`${rsbuildPath} build --config rsbuild.config.ts`, {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  });

  console.log('✅ Frontend build completed!');
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildFrontend();
}

export { buildFrontend };