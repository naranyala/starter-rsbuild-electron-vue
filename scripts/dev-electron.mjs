#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import net from 'net';
import {
  checkNodeModules,
  getElectronPath,
  getRsbuildPath,
} from './check-dependencies.mjs';

// Utility to find a random available port
function findRandomAvailablePort(min = 4000, max = 9999, maxRetries = 20) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const tryRandomPort = () => {
      const port = Math.floor(Math.random() * (max - min + 1)) + min;
      attempts++;

      const server = net.createServer();
      server.unref();
      server.on('error', () => {
        if (attempts < maxRetries) {
          tryRandomPort();
        } else {
          reject(
            new Error(
              `Could not find available port after ${maxRetries} attempts`
            )
          );
        }
      });
      server.on('listening', () => {
        server.close();
        resolve(port);
      });
      server.listen(port, '127.0.0.1');
    };

    tryRandomPort();
  });
}

// Start Electron development environment
async function startDevElectron() {
  console.log('🔧 Starting Electron development environment...');

  checkNodeModules();

  const rsbuildPath = getRsbuildPath();
  if (!fs.existsSync(rsbuildPath)) {
    console.error('❌ Rsbuild not found. Please install dependencies first.');
    process.exit(1);
  }

  // Set environment variables to help with KIO issues on KDE systems
  const envVars = {
    ...process.env,
    NODE_ENV: 'development',
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
  };

  // Find a random available port for rsbuild
  try {
    const rsbuildPort = await findRandomAvailablePort(4000, 9999);
    console.log(`🎲 Rsbuild using randomized port: ${rsbuildPort}`);

    // Start Rsbuild dev server with explicit port
    const devServer = spawn(
      rsbuildPath,
      [
        'dev',
        '--config',
        'rsbuild.config.ts',
        '--port',
        rsbuildPort.toString(),
      ],
      {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: envVars,
      }
    );

    const devServerUrl = `http://localhost:${rsbuildPort}`;
    console.log(`📡 Dev server URL: ${devServerUrl}`);

    // Capture output
    devServer.stdout.on('data', data => {
      console.log(data.toString());
    });

    devServer.stderr.on('data', data => {
      console.error(data.toString());
    });

    // Wait for the dev server to start, then launch Electron
    setTimeout(async () => {
      const electronPath = getElectronPath();
      if (!fs.existsSync(electronPath)) {
        console.error(
          '❌ Electron not found. Please install dependencies first.'
        );
        process.exit(1);
      }

      console.log(`📱 Launching Electron app pointing to ${devServerUrl}...`);

      // Compile main process files to ES modules first
      try {
        execSync('npx tsc -p tsconfig.json', { stdio: 'inherit' });

        // Fix import paths by adding .js extensions
        execSync('node scripts/fix-imports.js', { stdio: 'inherit' });

        // Create a simple package.json in dist-ts to mark it as ES module
        const distTsPackageJson = './dist-ts/package.json';
        if (!fs.existsSync(distTsPackageJson)) {
          fs.writeFileSync(
            distTsPackageJson,
            JSON.stringify({ type: 'module' }, null, 2)
          );
        }

        // Copy preload script to dist-ts
        const preloadSrc = './src/preload.js';
        const preloadDest = './dist-ts/preload.js';
        if (fs.existsSync(preloadSrc)) {
          fs.copyFileSync(preloadSrc, preloadDest);
          console.log('✅ Preload script copied to dist-ts');
        }

        const electronProcess = spawn(
          electronPath,
          ['dist-ts/src/main-dev.js'],
          {
            stdio: 'inherit',
            env: {
              ...envVars,
              NODE_ENV: 'development',
              ELECTRON_DEV_SERVER: devServerUrl,
            },
          }
        );

        electronProcess.on('close', code => {
          console.log(`Electron process exited with code ${code}`);
          devServer.kill();
        });

        electronProcess.on('error', err => {
          console.error('Electron process error:', err.message);
          devServer.kill();
        });
      } catch (error) {
        console.error('Build process failed:', error.message);
        devServer.kill();
        process.exit(1);
      }
    }, 3000);

    devServer.on('close', code => {
      console.log(`Development server exited with code ${code}`);
      process.exit(code);
    });

    devServer.on('error', err => {
      console.error('Development server error:', err.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to find available port:', error.message);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startDevElectron();
}

export { startDevElectron };
