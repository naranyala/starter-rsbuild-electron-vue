/**
 * Enhanced Process Utilities for Electron Main Process
 * These utilities help with system process management and execution
 */

import { spawn, exec, execFile, ChildProcess } from 'child_process';
import * as os from 'os';
import { promisify } from 'util';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

/**
 * Execute command and get output
 * @param command - Command to execute
 * @param options - Execution options
 * @returns Promise with { stdout, stderr }
 */
export async function executeCommand(command: string, options: any = {}): Promise<{
  stdout: string;
  stderr: string;
  success: boolean;
  code?: number;
}> {
  try {
    const { stdout, stderr } = await execAsync(command, {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024, // 1MB buffer
      timeout: 30000, // 30 seconds timeout
      ...options,
    });
    return { stdout: stdout.toString(), stderr: stderr.toString(), success: true };
  } catch (error: any) {
    return {
      stdout: error.stdout ? error.stdout.toString() : '',
      stderr: error.stderr ? error.stderr.toString() : error.message,
      success: false,
      code: error.code,
    };
  }
}

/**
 * Execute command file and get output
 * @param file - Executable file
 * @param args - Command arguments
 * @param options - Execution options
 * @returns Promise with { stdout, stderr }
 */
export async function executeFile(
  file: string,
  args: string[] = [],
  options: any = {}
): Promise<{
  stdout: string;
  stderr: string;
  success: boolean;
  code?: number;
}> {
  try {
    const { stdout, stderr } = await execFileAsync(file, args, {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
      timeout: 30000,
      ...options,
    });
    return { stdout: stdout.toString(), stderr: stderr.toString(), success: true };
  } catch (error: any) {
    return {
      stdout: error.stdout ? error.stdout.toString() : '',
      stderr: error.stderr ? error.stderr.toString() : error.message,
      success: false,
      code: error.code,
    };
  }
}

/**
 * Spawn a process and get process instance
 * @param command - Command to spawn
 * @param args - Command arguments
 * @param options - Spawn options
 * @returns Spawned process
 */
export function spawnProcess(command: string, args: string[] = [], options: any = {}): ChildProcess {
  const defaultOptions = {
    stdio: 'pipe',
    detached: false,
    ...options,
  };

  return spawn(command, args, defaultOptions);
}

/**
 * Kill process by PID
 * @param pid - Process ID
 * @param signal - Signal to send (default: 'SIGTERM')
 * @returns True if successful
 */
export function killProcess(pid: number, signal: NodeJS.Signals | number = 'SIGTERM'): boolean {
  try {
    process.kill(pid, signal);
    return true;
  } catch (error) {
    console.error('Error killing process:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Check if process is running
 * @param pid - Process ID
 * @returns True if process is running
 */
export function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get current process information
 * @returns Process information
 */
export function getCurrentProcessInfo(): {
  pid: number;
  ppid: number;
  title: string;
  version: string;
  versions: NodeJS.ProcessVersions;
  platform: NodeJS.Platform;
  arch: string;
  env: typeof process.env;
  argv: string[];
  execPath: string;
  execArgv: string[];
  cwd: string;
} {
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
 * @returns Memory usage information
 */
export function getMemoryUsage(): {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
  totalSystem: number;
  freeSystem: number;
  usedSystem: number;
} {
  const usage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();

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
 * @returns CPU usage information
 */
export function getCpuUsage(): NodeJS.CpuUsage {
  return process.cpuUsage();
}

/**
 * Get uptime
 * @returns Uptime information
 */
export function getUptime(): {
  process: number;
  system: number;
} {
  return {
    process: process.uptime(),
    system: os.uptime(),
  };
}

/**
 * Set environment variable
 * @param key - Environment variable name
 * @param value - Environment variable value
 */
export function setEnvVar(key: string, value: string): void {
  process.env[key] = value;
}

/**
 * Get environment variable
 * @param key - Environment variable name
 * @param defaultValue - Default value if not found
 * @returns Environment variable value
 */
export function getEnvVar(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

/**
 * Delete environment variable
 * @param key - Environment variable name
 */
export function deleteEnvVar(key: string): void {
  delete process.env[key];
}

/**
 * Get all environment variables
 * @returns Copy of environment variables
 */
export function getAllEnvVars(): typeof process.env {
  return { ...process.env };
}

/**
 * Exit current process
 * @param code - Exit code (default: 0)
 */
export function exitProcess(code: number = 0): void {
  process.exit(code);
}

/**
 * Send signal to current process
 * @param signal - Signal to send
 */
export function sendSignal(signal: string): void {
  process.kill(process.pid, signal);
}

/**
 * Graceful shutdown with cleanup
 * @param cleanup - Cleanup function to call
 * @param timeout - Timeout in milliseconds
 */
export function gracefulShutdown(cleanup?: () => void, timeout: number = 5000): void {
  const shutdown = () => {
    if (cleanup) {
      try {
        cleanup();
      } catch (error) {
        console.error('Error during cleanup:', error instanceof Error ? error.message : String(error));
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

/**
 * Enhanced process management utilities
 */
export class ProcessManager {
  private static processes: Map<number, ChildProcess> = new Map();

  /**
   * Execute a command and track the process
   * @param command - Command to execute
   * @param args - Arguments for the command
   * @param options - Process options
   * @returns Process ID
   */
  static execute(command: string, args: string[] = [], options: any = {}): number {
    const process = spawnProcess(command, args, options);
    const pid = process.pid;

    if (pid) {
      this.processes.set(pid, process);

      // Clean up when process exits
      process.on('exit', () => {
        this.processes.delete(pid);
      });
    }

    return pid || -1;
  }

  /**
   * Get a tracked process by PID
   * @param pid - Process ID
   * @returns Tracked process or null
   */
  static getProcess(pid: number): ChildProcess | null {
    return this.processes.get(pid) || null;
  }

  /**
   * Get all tracked processes
   * @returns Map of tracked processes
   */
  static getAllProcesses(): Map<number, ChildProcess> {
    return new Map(this.processes);
  }

  /**
   * Kill a tracked process
   * @param pid - Process ID
   * @param signal - Signal to send
   * @returns True if successful
   */
  static killProcess(pid: number, signal: NodeJS.Signals | number = 'SIGTERM'): boolean {
    const process = this.processes.get(pid);
    if (process) {
      try {
        process.kill(signal);
        return true;
      } catch (error) {
        console.error('Error killing tracked process:', error instanceof Error ? error.message : String(error));
        return false;
      }
    }
    return false;
  }

  /**
   * Kill all tracked processes
   */
  static killAllProcesses(): void {
    for (const [pid, process] of this.processes) {
      try {
        process.kill('SIGTERM');
      } catch (error) {
        console.error('Error killing process:', error instanceof Error ? error.message : String(error));
      }
    }
    this.processes.clear();
  }
}

/**
 * System information utilities
 */
export class SystemInfo {
  /**
   * Get detailed system information
   * @returns Comprehensive system information
   */
  static getDetailedInfo(): {
    os: {
      platform: NodeJS.Platform;
      arch: string;
      release: string;
      hostname: string;
      homedir: string;
      tmpdir: string;
      uptime: number;
    };
    cpu: {
      count: number;
      model: string;
      speed: number;
      usage: NodeJS.CpuUsage;
    };
    memory: {
      total: number;
      free: number;
      usage: number;
      process: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
        arrayBuffers: number;
      };
    };
    network: {
      interfaces: NodeJS.Dict<os.NetworkInterfaceInfo[]>;
    };
  } {
    const cpus = os.cpus();
    const memoryUsage = process.memoryUsage();

    return {
      os: {
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        hostname: os.hostname(),
        homedir: os.homedir(),
        tmpdir: os.tmpdir(),
        uptime: os.uptime(),
      },
      cpu: {
        count: cpus.length,
        model: cpus[0]?.model || 'Unknown',
        speed: cpus[0]?.speed || 0,
        usage: process.cpuUsage(),
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        usage: (os.totalmem() - os.freemem()) / os.totalmem(),
        process: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external,
          arrayBuffers: memoryUsage.arrayBuffers,
        },
      },
      network: {
        interfaces: os.networkInterfaces(),
      },
    };
  }

  /**
   * Check if the system meets minimum requirements
   * @param minMemory - Minimum memory in bytes
   * @param minCpuCores - Minimum CPU cores
   * @returns True if system meets requirements
   */
  static meetsRequirements(minMemory: number, minCpuCores: number): boolean {
    return os.totalmem() >= minMemory && os.cpus().length >= minCpuCores;
  }
}