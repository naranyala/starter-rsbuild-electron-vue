/**
 * Process Management Utilities for Electron Main Process
 * These utilities help with system process management and execution
 */

const { spawn, exec, execFile } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

/**
 * Execute command and get output
 * @param {string} command - Command to execute
 * @param {object} options - Execution options
 * @returns {Promise<object>} - Promise with { stdout, stderr }
 */
async function executeCommand(command, options = {}) {
  try {
    const { stdout, stderr } = await execAsync(command, {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024, // 1MB buffer
      timeout: 30000, // 30 seconds timeout
      ...options,
    });
    return { stdout, stderr, success: true };
  } catch (error) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
      success: false,
      code: error.code,
    };
  }
}

/**
 * Execute command file and get output
 * @param {string} file - Executable file
 * @param {string[]} args - Command arguments
 * @param {object} options - Execution options
 * @returns {Promise<object>} - Promise with { stdout, stderr }
 */
async function executeFile(file, args = [], options = {}) {
  try {
    const { stdout, stderr } = await execFileAsync(file, args, {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
      timeout: 30000,
      ...options,
    });
    return { stdout, stderr, success: true };
  } catch (error) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
      success: false,
      code: error.code,
    };
  }
}

/**
 * Spawn a process and get process instance
 * @param {string} command - Command to spawn
 * @param {string[]} args - Command arguments
 * @param {object} options - Spawn options
 * @returns {child_process.ChildProcess} - Spawned process
 */
function spawnProcess(command, args = [], options = {}) {
  const defaultOptions = {
    stdio: 'pipe',
    detached: false,
    ...options,
  };

  return spawn(command, args, defaultOptions);
}

/**
 * Kill process by PID
 * @param {number} pid - Process ID
 * @param {string} signal - Signal to send (default: 'SIGTERM')
 * @returns {boolean} - True if successful
 */
function killProcess(pid, signal = 'SIGTERM') {
  try {
    process.kill(pid, signal);
    return true;
  } catch (error) {
    console.error('Error killing process:', error);
    return false;
  }
}

/**
 * Check if process is running
 * @param {number} pid - Process ID
 * @returns {boolean} - True if process is running
 */
function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get current process information
 * @returns {object} - Process information
 */
function getCurrentProcessInfo() {
  return {
    pid: process.pid,
    ppid: process.ppid,
    title: process.title,
    version: process.version,
    versions: process.versions,
    platform: process.platform,
    arch: process.arch,
    env: { ...process.env },
    argv: [...process.argv],
    execPath: process.execPath,
    execArgv: process.execArgv,
    cwd: process.cwd(),
  };
}

/**
 * Get system memory usage
 * @returns {object} - Memory usage information
 */
function getMemoryUsage() {
  const usage = process.memoryUsage();
  const totalMem = require('os').totalmem();
  const freeMem = require('os').freemem();

  return {
    rss: usage.rss,
    heapTotal: usage.heapTotal,
    heapUsed: usage.heapUsed,
    external: usage.external,
    arrayBuffers: usage.arrayBuffers,
    totalSystem: totalMem,
    freeSystem: freeMem,
    usedSystem: totalMem - freeMem,
  };
}

/**
 * Get CPU usage
 * @returns {object} - CPU usage information
 */
function getCpuUsage() {
  return process.cpuUsage();
}

/**
 * Get uptime
 * @returns {object} - Uptime information
 */
function getUptime() {
  return {
    process: process.uptime(),
    system: require('os').uptime(),
  };
}

/**
 * Set environment variable
 * @param {string} key - Environment variable name
 * @param {string} value - Environment variable value
 */
function setEnvVar(key, value) {
  process.env[key] = value;
}

/**
 * Get environment variable
 * @param {string} key - Environment variable name
 * @param {string} defaultValue - Default value if not found
 * @returns {string} - Environment variable value
 */
function getEnvVar(key, defaultValue = '') {
  return process.env[key] || defaultValue;
}

/**
 * Delete environment variable
 * @param {string} key - Environment variable name
 */
function deleteEnvVar(key) {
  delete process.env[key];
}

/**
 * Get all environment variables
 * @returns {object} - Copy of environment variables
 */
function getAllEnvVars() {
  return { ...process.env };
}

/**
 * Exit current process
 * @param {number} code - Exit code (default: 0)
 */
function exitProcess(code = 0) {
  process.exit(code);
}

/**
 * Send signal to current process
 * @param {string} signal - Signal to send
 */
function sendSignal(signal) {
  process.kill(process.pid, signal);
}

/**
 * Graceful shutdown with cleanup
 * @param {Function} cleanup - Cleanup function to call
 * @param {number} timeout - Timeout in milliseconds
 */
function gracefulShutdown(cleanup, timeout = 5000) {
  const shutdown = () => {
    if (cleanup) {
      try {
        cleanup();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
    process.exit(0);
  };

  // Handle common signals
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Force exit after timeout
  setTimeout(() => {
    console.log('Forcing exit after timeout');
    process.exit(1);
  }, timeout);
}

module.exports = {
  executeCommand,
  executeFile,
  spawnProcess,
  killProcess,
  isProcessRunning,
  getCurrentProcessInfo,
  getMemoryUsage,
  getCpuUsage,
  getUptime,
  setEnvVar,
  getEnvVar,
  deleteEnvVar,
  getAllEnvVars,
  exitProcess,
  sendSignal,
  gracefulShutdown,
};
