/**
 * Enhanced Process Utilities for Electron Main Process
 * These utilities help with system process management and execution
 */
import { ChildProcess } from 'child_process';
import * as os from 'os';
/**
 * Execute command and get output
 * @param command - Command to execute
 * @param options - Execution options
 * @returns Promise with { stdout, stderr }
 */
export declare function executeCommand(command: string, options?: any): Promise<{
    stdout: string;
    stderr: string;
    success: boolean;
    code?: number;
}>;
/**
 * Execute command file and get output
 * @param file - Executable file
 * @param args - Command arguments
 * @param options - Execution options
 * @returns Promise with { stdout, stderr }
 */
export declare function executeFile(file: string, args?: string[], options?: any): Promise<{
    stdout: string;
    stderr: string;
    success: boolean;
    code?: number;
}>;
/**
 * Spawn a process and get process instance
 * @param command - Command to spawn
 * @param args - Command arguments
 * @param options - Spawn options
 * @returns Spawned process
 */
export declare function spawnProcess(command: string, args?: string[], options?: any): ChildProcess;
/**
 * Kill process by PID
 * @param pid - Process ID
 * @param signal - Signal to send (default: 'SIGTERM')
 * @returns True if successful
 */
export declare function killProcess(pid: number, signal?: NodeJS.Signals | number): boolean;
/**
 * Check if process is running
 * @param pid - Process ID
 * @returns True if process is running
 */
export declare function isProcessRunning(pid: number): boolean;
/**
 * Get current process information
 * @returns Process information
 */
export declare function getCurrentProcessInfo(): {
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
};
/**
 * Get system memory usage
 * @returns Memory usage information
 */
export declare function getMemoryUsage(): {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
    totalSystem: number;
    freeSystem: number;
    usedSystem: number;
};
/**
 * Get CPU usage
 * @returns CPU usage information
 */
export declare function getCpuUsage(): NodeJS.CpuUsage;
/**
 * Get uptime
 * @returns Uptime information
 */
export declare function getUptime(): {
    process: number;
    system: number;
};
/**
 * Set environment variable
 * @param key - Environment variable name
 * @param value - Environment variable value
 */
export declare function setEnvVar(key: string, value: string): void;
/**
 * Get environment variable
 * @param key - Environment variable name
 * @param defaultValue - Default value if not found
 * @returns Environment variable value
 */
export declare function getEnvVar(key: string, defaultValue?: string): string;
/**
 * Delete environment variable
 * @param key - Environment variable name
 */
export declare function deleteEnvVar(key: string): void;
/**
 * Get all environment variables
 * @returns Copy of environment variables
 */
export declare function getAllEnvVars(): typeof process.env;
/**
 * Exit current process
 * @param code - Exit code (default: 0)
 */
export declare function exitProcess(code?: number): void;
/**
 * Send signal to current process
 * @param signal - Signal to send
 */
export declare function sendSignal(signal: string): void;
/**
 * Graceful shutdown with cleanup
 * @param cleanup - Cleanup function to call
 * @param timeout - Timeout in milliseconds
 */
export declare function gracefulShutdown(cleanup?: () => void, timeout?: number): void;
/**
 * Enhanced process management utilities
 */
export declare class ProcessManager {
    private static processes;
    /**
     * Execute a command and track the process
     * @param command - Command to execute
     * @param args - Arguments for the command
     * @param options - Process options
     * @returns Process ID
     */
    static execute(command: string, args?: string[], options?: any): number;
    /**
     * Get a tracked process by PID
     * @param pid - Process ID
     * @returns Tracked process or null
     */
    static getProcess(pid: number): ChildProcess | null;
    /**
     * Get all tracked processes
     * @returns Map of tracked processes
     */
    static getAllProcesses(): Map<number, ChildProcess>;
    /**
     * Kill a tracked process
     * @param pid - Process ID
     * @param signal - Signal to send
     * @returns True if successful
     */
    static killProcess(pid: number, signal?: NodeJS.Signals | number): boolean;
    /**
     * Kill all tracked processes
     */
    static killAllProcesses(): void;
}
/**
 * System information utilities
 */
export declare class SystemInfo {
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
    };
    /**
     * Check if the system meets minimum requirements
     * @param minMemory - Minimum memory in bytes
     * @param minCpuCores - Minimum CPU cores
     * @returns True if system meets requirements
     */
    static meetsRequirements(minMemory: number, minCpuCores: number): boolean;
}
//# sourceMappingURL=process-utils.d.ts.map