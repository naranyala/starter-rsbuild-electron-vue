import { spawn } from 'child_process';

// Generate a random port between 10000 and 19999
const port = Math.floor(Math.random() * 10000) + 10000;

console.log(`Starting development server on port ${port}...`);

// Start Rsbuild dev server
const rsbuildProcess = spawn('bunx', ['rsbuild', 'dev', '--port', port], {
  stdio: 'inherit',
  shell: true,
});

// Wait a bit for the Rsbuild server to start, then launch Electron
setTimeout(() => {
  const electronProcess = spawn(
    'electron',
    [`main.cjs`, `--start-dev`, `--port=${port}`],
    {
      stdio: 'inherit',
      shell: true,
    }
  );

  electronProcess.on('close', code => {
    console.log(`Electron process exited with code ${code}`);
    // Kill the Rsbuild process when Electron exits
    rsbuildProcess.kill();
    process.exit(code);
  });
}, 3000); // Wait 3 seconds for Rsbuild to start

// Handle process termination
process.on('SIGINT', () => {
  rsbuildProcess.kill();
  process.exit(0);
});
