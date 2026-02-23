#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';
import { buildFrontend } from './build-frontend.mjs';

// Build full Electron app
function buildElectron(shouldPackage = false) {
  console.log('🚀 Building Electron app...');

  // Compile TypeScript first
  console.log('🔧 Compiling TypeScript...');
  execSync('npm run build:ts', { stdio: 'inherit' });

  // Build frontend first
  buildFrontend();

  // Verify build exists
  if (!fs.existsSync('./build/index.html')) {
    console.error('❌ Build failed: index.html not found in build directory');
    process.exit(1);
  }

  console.log('✅ Frontend build completed successfully!');

  // Package with electron-builder if requested
  if (shouldPackage) {
    console.log('📦 Packaging Electron app...');

    const electronBuilderPath = './node_modules/.bin/electron-builder';
    if (fs.existsSync(electronBuilderPath)) {
      try {
        execSync(`${electronBuilderPath}`, {
          stdio: 'inherit',
          env: { ...process.env, NODE_ENV: 'production' },
        });
      } finally {
        // Clean up the build directory since it's no longer needed after packaging
        // Do this regardless of whether packaging succeeded or failed
        if (fs.existsSync('./build')) {
          execSync('rm -rf build/', { stdio: 'inherit' });
        }
      }
    } else {
      console.log(
        '⚠️  electron-builder not found. Install with: bun install electron-builder'
      );
    }
  } else {
    // For non-packaged builds, we still need the build directory for running the app
    console.log(
      '📁 Built files are located in the ./build directory for running'
    );
  }

  console.log('🎉 Electron app build completed!');
  if (shouldPackage) {
    console.log('📁 Packaged files are located in the ./dist directory');
    console.log(
      '🎮 To run the packaged app, execute the generated executable in ./dist'
    );
  } else {
    console.log('📁 Built files are located in the ./build directory');
    console.log('🎮 To run the app, use: bun run start');
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const shouldPackage = args.includes('--package');
  buildElectron(shouldPackage);
}

export { buildElectron };