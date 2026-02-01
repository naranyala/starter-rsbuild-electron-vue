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

        // Copy preload script to dist-ts (use original, not bundled)
        const preloadSrc = './src/preload.js';
        const preloadDest = './dist-ts/preload.js';
        if (fs.existsSync(preloadSrc)) {
          // Write the preload script directly without bundling
          const preloadContent = `// Preload Script for Electron Renderer Process
const electron = require('electron');
const contextBridge = electron.contextBridge;
const ipcRenderer = electron.ipcRenderer;

contextBridge.exposeInMainWorld('electronAPI', {
  fs: {
    readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', filePath, content),
    exists: (filePath) => ipcRenderer.invoke('fs:exists', filePath),
    mkdir: (dirPath) => ipcRenderer.invoke('fs:mkdir', dirPath),
    readdir: (dirPath) => ipcRenderer.invoke('fs:readdir', dirPath),
    deleteFile: (filePath) => ipcRenderer.invoke('fs:deleteFile', filePath),
  },
  dialog: {
    showOpenDialog: (options) => ipcRenderer.invoke('dialog:showOpenDialog', options),
    showSaveDialog: (options) => ipcRenderer.invoke('dialog:showSaveDialog', options),
    showMessageDialog: (options) => ipcRenderer.invoke('dialog:showMessageDialog', options),
  },
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    focus: () => ipcRenderer.send('window:focus'),
    center: () => ipcRenderer.send('window:center'),
    getBounds: () => ipcRenderer.invoke('window:getBounds'),
    setBounds: (bounds) => ipcRenderer.invoke('window:setBounds', bounds),
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getName: () => ipcRenderer.invoke('app:getName'),
    getPath: (name) => ipcRenderer.invoke('app:getPath', name),
    quit: () => ipcRenderer.send('app:quit'),
    focus: () => ipcRenderer.send('app:focus'),
    setBadgeCount: (count) => ipcRenderer.send('app:setBadgeCount', count),
  },
  system: {
    getPlatform: () => ipcRenderer.invoke('system:getPlatform'),
    getArch: () => ipcRenderer.invoke('system:getArch'),
    getSystemInfo: () => ipcRenderer.invoke('system:getInfo'),
    showInFolder: (fullPath) => ipcRenderer.invoke('system:showInFolder', fullPath),
    openExternal: (url) => ipcRenderer.invoke('system:openExternal', url),
  },
  process: {
    execCommand: (command, options) => ipcRenderer.invoke('process:execCommand', command, options),
    spawnProcess: (command, args, options) => ipcRenderer.invoke('process:spawnProcess', command, args, options),
    killProcess: (pid) => ipcRenderer.invoke('process:killProcess', pid),
  },
  ipc: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    on: (channel, listener) => {
      const wrappedListener = (_event, ...args) => listener(...args);
      ipcRenderer.on(channel, wrappedListener);
      return () => ipcRenderer.removeListener(channel, wrappedListener);
    },
    once: (channel, listener) => {
      const wrappedListener = (_event, ...args) => listener(...args);
      ipcRenderer.once(channel, wrappedListener);
      return () => ipcRenderer.removeListener(channel, wrappedListener);
    },
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  },
  clipboard: {
    readText: () => ipcRenderer.invoke('clipboard:readText'),
    writeText: (text) => ipcRenderer.invoke('clipboard:writeText', text),
  },
  notification: {
    show: (options) => ipcRenderer.invoke('notification:show', options),
    requestPermission: () => ipcRenderer.invoke('notification:requestPermission'),
  },
  menu: {
    showContextMenu: (template) => ipcRenderer.invoke('menu:showContextMenu', template),
    setApplicationMenu: (template) => ipcRenderer.invoke('menu:setApplicationMenu', template),
  },
  shell: {
    openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
    openPath: (path) => ipcRenderer.invoke('shell:openPath', path),
    showItemInFolder: (fullPath) => ipcRenderer.invoke('shell:showItemInFolder', fullPath),
  },
});

contextBridge.exposeInMainWorld('nodeEnv', {
  platform: process.platform,
  arch: process.arch,
  version: process.version,
});
`;
          fs.writeFileSync(preloadDest, preloadContent);
          console.log('✅ Preload script written to dist-ts');
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
              // Uncomment the line below to automatically open devtools on launch:
              // OPEN_DEVTOOLS: '1',
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
