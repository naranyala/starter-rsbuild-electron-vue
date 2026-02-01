#!/usr/bin/env node

import fs from 'fs';
import { spawn, execSync } from 'child_process';
import { checkNodeModules, getRsbuildPath, getElectronPath } from './check-dependencies.mjs';

// Start Electron development environment
function startDevElectron() {
  console.log('🔧 Starting Electron development environment...');

  checkNodeModules();

  const rsbuildPath = getRsbuildPath();
  if (!fs.existsSync(rsbuildPath)) {
    console.error('❌ Rsbuild not found. Please install dependencies first.');
    process.exit(1);
  }

  // Start Rsbuild dev server
  const devServer = spawn(
    rsbuildPath,
    ['dev', '--config', 'rsbuild.config.ts'],
    {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' },
    }
  );

  // Wait a bit for the dev server to start, then launch Electron
  setTimeout(() => {
    const electronPath = getElectronPath();
    if (!fs.existsSync(electronPath)) {
      console.error(
        '❌ Electron not found. Please install dependencies first.'
      );
      process.exit(1);
    }

    console.log('📱 Launching Electron app pointing to development server...');

    // Compile main process files to ES modules first
    try {
      execSync('npx tsc -p tsconfig.json', { stdio: 'inherit' });

      // Fix import paths by adding .js extensions
      execSync('node scripts/fix-imports.js', { stdio: 'inherit' });

      // Create a simple package.json in dist-ts to mark it as ES module
      const distTsPackageJson = './dist-ts/package.json';
      if (!fs.existsSync(distTsPackageJson)) {
        fs.writeFileSync(distTsPackageJson, JSON.stringify({ type: 'module' }, null, 2));
      }

      const electronProcess = spawn(
        electronPath,
        ['dist-ts/src/main-dev.js'],
        {
          stdio: 'inherit',
          env: {
            ...process.env,
            NODE_ENV: 'development',
            ELECTRON_DEV_SERVER: 'http://localhost:3000',
          },
        }
      );

      electronProcess.on('close', code => {
        console.log(`Electron process exited with code ${code}`);
      });

      electronProcess.on('error', err => {
        console.error('Electron process error:', err.message);
      });
    } catch (error) {
      console.error('Build process failed:', error.message);
      process.exit(1);
    }
  }, 3000);

  devServer.on('close', code => {
    console.log(`Development server exited with code ${code}`);
    process.exit(code);
  });

  devServer.on('error', err => {
    console.error('Development server error:', err.message);
  });
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startDevElectron();
}

export { startDevElectron };