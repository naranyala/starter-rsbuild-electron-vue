#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';
import { checkNodeModules, getRsbuildPath } from './check-dependencies.mjs';

// Start development server for web
function startDevWeb() {
  console.log('🔧 Starting web development server...');

  checkNodeModules();

  const rsbuildPath = getRsbuildPath();
  if (!fs.existsSync(rsbuildPath)) {
    console.error('❌ Rsbuild not found. Please install dependencies first.');
    process.exit(1);
  }

  execSync(`${rsbuildPath} dev --config rsbuild.config.ts`, {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' },
  });
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startDevWeb();
}

export { startDevWeb };