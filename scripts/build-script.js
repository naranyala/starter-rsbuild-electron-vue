import { execSync } from 'child_process';

console.log('Building application with Rsbuild...');

try {
  // Clean build directory first
  execSync('rm -rf build/', { stdio: 'pipe' }).toString();

  // Run rsbuild build using Bun
  execSync('bunx rsbuild build --config scripts/rsbuild.config.js', {
    stdio: 'inherit',
  });

  // Copy the favicon after successful build
  execSync('cp src/assets/favicon.ico build/favicon.ico', { stdio: 'inherit' });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Error during build:', error.message);
  process.exit(1);
}
