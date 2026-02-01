/**
 * Enhanced File System Utilities for Electron Main Process
 * These utilities are only available in the Node.js environment (Electron main)
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';

const fsAccess = promisify(fs.access);
const fsReadFile = promisify(fs.readFile);
const fsWriteFile = promisify(fs.writeFile);
const fsMkdir = promisify(fs.mkdir);
const fsReaddir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);
const fsCopyFile = promisify(fs.copyFile);
const fsUnlink = promisify(fs.unlink);

/**
 * Check if a file exists
 * @param filePath - Path to the file
 * @returns True if file exists
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    console.error(
      'Error checking file existence:',
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

/**
 * Check if a path is a file
 * @param filePath - Path to check
 * @returns True if path is a file
 */
export function isFile(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (error) {
    console.error('Error checking if path is file:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Check if a path is a directory
 * @param dirPath - Path to check
 * @returns True if path is a directory
 */
export function isDirectory(dirPath: string): boolean {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (error) {
    console.error('Error checking if path is directory:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Read a file safely
 * @param filePath - Path to the file
 * @param encoding - File encoding (default: 'utf8')
 * @returns File content or null if error
 */
export function readFile(filePath: string, encoding: BufferEncoding = 'utf8'): string | null {
  try {
    return fs.readFileSync(filePath, encoding);
  } catch (error) {
    console.error('Error reading file:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Write content to a file
 * @param filePath - Path to the file
 * @param content - Content to write
 * @param encoding - File encoding (default: 'utf8')
 * @returns True if successful
 */
export function writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf8'): boolean {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, encoding);
    return true;
  } catch (error) {
    console.error('Error writing file:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Read a JSON file safely
 * @param filePath - Path to the JSON file
 * @returns Parsed JSON object or null if error
 */
export function readJsonFile(filePath: string): any | null {
  try {
    if (fileExists(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
    return null;
  } catch (error) {
    console.error('Error reading JSON file:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Write data to a JSON file
 * @param filePath - Path to the JSON file
 * @param data - Data to write
 * @param space - JSON spacing (default: 2)
 * @returns True if successful
 */
export function writeJsonFile(filePath: string, data: any, space: number | undefined = 2): boolean {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, space), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing JSON file:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Create a directory recursively
 * @param dirPath - Directory path to create
 * @returns True if successful
 */
export function createDirectory(dirPath: string): boolean {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error('Error creating directory:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Delete a file or directory recursively
 * @param targetPath - Path to delete
 * @returns True if successful
 */
export function deletePath(targetPath: string): boolean {
  try {
    if (!fs.existsSync(targetPath)) {
      return true;
    }

    const stats = fs.statSync(targetPath);
    if (stats.isDirectory()) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(targetPath);
    }
    return true;
  } catch (error) {
    console.error('Error deleting path:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Copy a file or directory
 * @param sourcePath - Source path
 * @param destPath - Destination path
 * @returns True if successful
 */
export function copyPath(sourcePath: string, destPath: string): boolean {
  try {
    if (!fs.existsSync(sourcePath)) {
      return false;
    }

    const stats = fs.statSync(sourcePath);
    if (stats.isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
    return true;
  } catch (error) {
    console.error('Error copying path:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Copy a directory recursively
 * @param sourceDir - Source directory
 * @param destDir - Destination directory
 */
export function copyDirectory(sourceDir: string, destDir: string): void {
  createDirectory(destDir);

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

/**
 * List files in a directory
 * @param dirPath - Directory path
 * @param recursive - Whether to list recursively
 * @returns Array of file paths
 */
export function listFiles(dirPath: string, recursive = false): string[] {
  try {
    if (!fs.existsSync(dirPath)) {
      return [];
    }

    const files: string[] = [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isFile()) {
        files.push(fullPath);
      } else if (entry.isDirectory() && recursive) {
        files.push(...listFiles(fullPath, true));
      }
    }

    return files;
  } catch (error) {
    console.error('Error listing files:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Get file size in bytes
 * @param filePath - Path to the file
 * @returns File size in bytes or null if error
 */
export function getFileSize(filePath: string): number | null {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    console.error('Error getting file size:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Get file modification time
 * @param filePath - Path to the file
 * @returns Modification time or null if error
 */
export function getFileModifiedTime(filePath: string): Date | null {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime;
  } catch (error) {
    console.error('Error getting file modification time:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Watch a file or directory for changes
 * @param targetPath - Path to watch
 * @param callback - Callback function for changes
 * @param options - Watch options
 * @returns File system watcher or null if error
 */
export function watchPath(
  targetPath: string,
  callback: (eventType: string, filename: string | null) => void,
  options?: { recursive?: boolean; encoding?: BufferEncoding }
): fs.FSWatcher | null {
  try {
    if (options?.recursive !== undefined) {
      // Use the recursive option if available in the Node.js version
      return fs.watch(targetPath, {
        encoding: options.encoding || 'utf8',
        recursive: options.recursive
      }, callback as fs.WatchListener<string>);
    } else {
      // Fallback for older Node.js versions
      return fs.watch(targetPath, options?.encoding || 'utf8', callback as fs.WatchListener<string>);
    }
  } catch (error) {
    console.error('Error watching path:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Get app data directory
 * @param appName - Application name
 * @returns App data directory path
 */
export function getAppDataDir(appName: string): string {
  const platform = process.platform;

  let basePath: string;
  switch (platform) {
    case 'win32':
      basePath =
        process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
      break;
    case 'darwin':
      basePath = path.join(os.homedir(), 'Library', 'Application Support');
      break;
    default:
      basePath =
        process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
  }

  return path.join(basePath, appName);
}

/**
 * Get user home directory
 * @returns User home directory path
 */
export function getHomeDir(): string {
  return os.homedir();
}

/**
 * Get temporary directory
 * @returns Temporary directory path
 */
export function getTempDir(): string {
  return os.tmpdir();
}

/**
 * Get system information
 * @returns System information object
 */
export function getSystemInfo(): {
  platform: NodeJS.Platform;
  arch: string;
  release: string;
  hostname: string;
  cpus: os.CpuInfo[];
  totalMemory: number;
  freeMemory: number;
  homeDir: string;
  tempDir: string;
} {
  return {
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    hostname: os.hostname(),
    cpus: os.cpus(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    homeDir: os.homedir(),
    tempDir: os.tmpdir(),
  };
}

/**
 * Enhanced async file operations
 */
export const AsyncFileOperations = {
  /**
   * Async version of fileExists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fsAccess(filePath);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Async version of readFile
   */
  async readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string | null> {
    try {
      const content = await fsReadFile(filePath, encoding);
      return content.toString();
    } catch (error) {
      console.error('Error reading file asynchronously:', error instanceof Error ? error.message : String(error));
      return null;
    }
  },

  /**
   * Async version of writeFile
   */
  async writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf8'): Promise<boolean> {
    try {
      const dir = path.dirname(filePath);
      await fsMkdir(dir, { recursive: true });
      await fsWriteFile(filePath, content, { encoding });
      return true;
    } catch (error) {
      console.error('Error writing file asynchronously:', error instanceof Error ? error.message : String(error));
      return false;
    }
  },

  /**
   * Async version of readJsonFile
   */
  async readJsonFile(filePath: string): Promise<any | null> {
    try {
      const content = await this.readFile(filePath, 'utf8');
      return content ? JSON.parse(content) : null;
    } catch (error) {
      console.error('Error reading JSON file asynchronously:', error instanceof Error ? error.message : String(error));
      return null;
    }
  },

  /**
   * Async version of writeJsonFile
   */
  async writeJsonFile(filePath: string, data: any, space: number | undefined = 2): Promise<boolean> {
    try {
      const content = JSON.stringify(data, null, space);
      return await this.writeFile(filePath, content, 'utf8');
    } catch (error) {
      console.error('Error writing JSON file asynchronously:', error instanceof Error ? error.message : String(error));
      return false;
    }
  },

  /**
   * Async version of listFiles
   */
  async listFiles(dirPath: string, recursive = false): Promise<string[]> {
    try {
      if (!await this.fileExists(dirPath)) {
        return [];
      }

      const entries = await fsReaddir(dirPath, { withFileTypes: true });
      const files: string[] = [];

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isFile()) {
          files.push(fullPath);
        } else if (entry.isDirectory() && recursive) {
          files.push(...await this.listFiles(fullPath, true));
        }
      }

      return files;
    } catch (error) {
      console.error('Error listing files asynchronously:', error instanceof Error ? error.message : String(error));
      return [];
    }
  },

  /**
   * Async version of copyPath
   */
  async copyPath(sourcePath: string, destPath: string): Promise<boolean> {
    try {
      if (!await this.fileExists(sourcePath)) {
        return false;
      }

      const stats = await fsStat(sourcePath);
      if (stats.isDirectory()) {
        await this.copyDirectory(sourcePath, destPath);
      } else {
        await fsCopyFile(sourcePath, destPath);
      }
      return true;
    } catch (error) {
      console.error('Error copying path asynchronously:', error instanceof Error ? error.message : String(error));
      return false;
    }
  },

  /**
   * Async version of copyDirectory
   */
  async copyDirectory(sourceDir: string, destDir: string): Promise<void> {
    await fsMkdir(destDir, { recursive: true });

    const entries = await fsReaddir(sourceDir, { withFileTypes: true });
    for (const entry of entries) {
      const sourcePath = path.join(sourceDir, entry.name);
      const destPath = path.join(destDir, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(sourcePath, destPath);
      } else {
        await fsCopyFile(sourcePath, destPath);
      }
    }
  },

  /**
   * Async version of deletePath
   */
  async deletePath(targetPath: string): Promise<boolean> {
    try {
      if (!await this.fileExists(targetPath)) {
        return true;
      }

      const stats = await fsStat(targetPath);
      if (stats.isDirectory()) {
        await fs.promises.rm(targetPath, { recursive: true, force: true });
      } else {
        await fs.promises.unlink(targetPath);
      }
      return true;
    } catch (error) {
      console.error('Error deleting path asynchronously:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }
};