/**
 * Enhanced File System Utilities for Electron Main Process
 * These utilities are only available in the Node.js environment (Electron main)
 */
import * as fs from 'fs';
import * as os from 'os';
/**
 * Check if a file exists
 * @param filePath - Path to the file
 * @returns True if file exists
 */
export declare function fileExists(filePath: string): boolean;
/**
 * Check if a path is a file
 * @param filePath - Path to check
 * @returns True if path is a file
 */
export declare function isFile(filePath: string): boolean;
/**
 * Check if a path is a directory
 * @param dirPath - Path to check
 * @returns True if path is a directory
 */
export declare function isDirectory(dirPath: string): boolean;
/**
 * Read a file safely
 * @param filePath - Path to the file
 * @param encoding - File encoding (default: 'utf8')
 * @returns File content or null if error
 */
export declare function readFile(filePath: string, encoding?: BufferEncoding): string | null;
/**
 * Write content to a file
 * @param filePath - Path to the file
 * @param content - Content to write
 * @param encoding - File encoding (default: 'utf8')
 * @returns True if successful
 */
export declare function writeFile(filePath: string, content: string, encoding?: BufferEncoding): boolean;
/**
 * Read a JSON file safely
 * @param filePath - Path to the JSON file
 * @returns Parsed JSON object or null if error
 */
export declare function readJsonFile(filePath: string): any | null;
/**
 * Write data to a JSON file
 * @param filePath - Path to the JSON file
 * @param data - Data to write
 * @param space - JSON spacing (default: 2)
 * @returns True if successful
 */
export declare function writeJsonFile(filePath: string, data: any, space?: number | undefined): boolean;
/**
 * Create a directory recursively
 * @param dirPath - Directory path to create
 * @returns True if successful
 */
export declare function createDirectory(dirPath: string): boolean;
/**
 * Delete a file or directory recursively
 * @param targetPath - Path to delete
 * @returns True if successful
 */
export declare function deletePath(targetPath: string): boolean;
/**
 * Copy a file or directory
 * @param sourcePath - Source path
 * @param destPath - Destination path
 * @returns True if successful
 */
export declare function copyPath(sourcePath: string, destPath: string): boolean;
/**
 * Copy a directory recursively
 * @param sourceDir - Source directory
 * @param destDir - Destination directory
 */
export declare function copyDirectory(sourceDir: string, destDir: string): void;
/**
 * List files in a directory
 * @param dirPath - Directory path
 * @param recursive - Whether to list recursively
 * @returns Array of file paths
 */
export declare function listFiles(dirPath: string, recursive?: boolean): string[];
/**
 * Get file size in bytes
 * @param filePath - Path to the file
 * @returns File size in bytes or null if error
 */
export declare function getFileSize(filePath: string): number | null;
/**
 * Get file modification time
 * @param filePath - Path to the file
 * @returns Modification time or null if error
 */
export declare function getFileModifiedTime(filePath: string): Date | null;
/**
 * Watch a file or directory for changes
 * @param targetPath - Path to watch
 * @param callback - Callback function for changes
 * @param options - Watch options
 * @returns File system watcher or null if error
 */
export declare function watchPath(targetPath: string, callback: (eventType: string, filename: string | null) => void, options?: {
    recursive?: boolean;
    encoding?: BufferEncoding;
}): fs.FSWatcher | null;
/**
 * Get app data directory
 * @param appName - Application name
 * @returns App data directory path
 */
export declare function getAppDataDir(appName: string): string;
/**
 * Get user home directory
 * @returns User home directory path
 */
export declare function getHomeDir(): string;
/**
 * Get temporary directory
 * @returns Temporary directory path
 */
export declare function getTempDir(): string;
/**
 * Get system information
 * @returns System information object
 */
export declare function getSystemInfo(): {
    platform: NodeJS.Platform;
    arch: string;
    release: string;
    hostname: string;
    cpus: os.CpuInfo[];
    totalMemory: number;
    freeMemory: number;
    homeDir: string;
    tempDir: string;
};
/**
 * Enhanced async file operations
 */
export declare const AsyncFileOperations: {
    /**
     * Async version of fileExists
     */
    fileExists(filePath: string): Promise<boolean>;
    /**
     * Async version of readFile
     */
    readFile(filePath: string, encoding?: BufferEncoding): Promise<string | null>;
    /**
     * Async version of writeFile
     */
    writeFile(filePath: string, content: string, encoding?: BufferEncoding): Promise<boolean>;
    /**
     * Async version of readJsonFile
     */
    readJsonFile(filePath: string): Promise<any | null>;
    /**
     * Async version of writeJsonFile
     */
    writeJsonFile(filePath: string, data: any, space?: number | undefined): Promise<boolean>;
    /**
     * Async version of listFiles
     */
    listFiles(dirPath: string, recursive?: boolean): Promise<string[]>;
    /**
     * Async version of copyPath
     */
    copyPath(sourcePath: string, destPath: string): Promise<boolean>;
    /**
     * Async version of copyDirectory
     */
    copyDirectory(sourceDir: string, destDir: string): Promise<void>;
    /**
     * Async version of deletePath
     */
    deletePath(targetPath: string): Promise<boolean>;
};
//# sourceMappingURL=filesystem-utils.d.ts.map