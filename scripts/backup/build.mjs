import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

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
    execSync('npx tsc -p tsconfig.json', { stdio: 'inherit' });

    // Fix import paths by adding .js extensions
    execSync('node scripts/fix-imports.js', { stdio: 'inherit' });

    // Create a simple package.json in dist-ts to mark it as ES module
    const distTsPackageJson = path.join(process.cwd(), 'dist-ts', 'package.json');
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
  }, 3000);

  devServer.on('close', code => {
    console.log(`Development server exited with code ${code}`);
    process.exit(code);
  });

  devServer.on('error', err => {
    console.error('Development server error:', err.message);
  });
}

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

  const electronProcess = spawn(electronPath, ['dist-ts/src/main.js'], {
    stdio: 'inherit',
    env: process.env,
  });

  electronProcess.on('close', code => {
    console.log(`Electron process exited with code ${code}`);
    process.exit(code);
  });

  electronProcess.on('error', err => {
    console.error('Electron process error:', err.message);
  });
}

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

  case 'start':
    startElectronApp();
    break;

  default:
    console.log('Usage:');
    console.log(
      '  node scripts/build.mjs build              # Build full Electron app'
    );
    console.log(
      '  node scripts/build.mjs build --package    # Build and package Electron app'
    );
    console.log(
      '  node scripts/build.mjs build:frontend     # Build frontend only'
    );
    console.log(
      '  node scripts/build.mjs dev                # Start Electron dev environment'
    );
    console.log(
      '  node scripts/build.mjs dev:electron       # Start Electron dev environment'
    );
    console.log(
      '  node scripts/build.mjs start              # Start built Electron app'
    );
    process.exit(1);
}
