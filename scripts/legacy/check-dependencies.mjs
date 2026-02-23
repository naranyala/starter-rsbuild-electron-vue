#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

// Check if node_modules exists
function checkNodeModules() {
  if (!fs.existsSync('./node_modules')) {
    console.log('⚠️  node_modules not found. Installing dependencies...');
    execSync('bun install || npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!');
  }
}

// Check if a specific package is installed
function isPackageInstalled(packageName) {
  return fs.existsSync(`./node_modules/${packageName}`);
}

// Get Rsbuild executable path
function getRsbuildPath() {
  return './node_modules/.bin/rsbuild';
}

// Get Electron executable path
function getElectronPath() {
  return './node_modules/.bin/electron';
}

export { checkNodeModules, isPackageInstalled, getRsbuildPath, getElectronPath };