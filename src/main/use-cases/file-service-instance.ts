import * as fs from 'fs';
import * as path from 'path';
import {
  copyDirectory,
  copyPath,
  createDirectory,
  deletePath,
  fileExists,
  getFileModifiedTime,
  getFileSize,
  getHomeDir,
  getSystemInfo,
  getTempDir,
  isDirectory,
  isFile,
  listFiles,
  readFile,
  readJsonFile,
  writeFile,
  writeJsonFile,
} from '../lib/filesystem-utils';

/**
 * File operation result
 */
export interface FileResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Service for file system operations
 * No decorators - plain TypeScript class
 */
export class FileServiceInstance {
  /**
   * Check if a path exists
   */
  exists(filePath: string): boolean {
    return fileExists(filePath);
  }

  /**
   * Check if path is a file
   */
  isFile(filePath: string): boolean {
    return isFile(filePath);
  }

  /**
   * Check if path is a directory
   */
  isDirectory(filePath: string): boolean {
    return isDirectory(filePath);
  }

  /**
   * Read a file
   */
  read(filePath: string): string {
    return readFile(filePath);
  }

  /**
   * Write to a file
   */
  write(filePath: string, content: string): void {
    writeFile(filePath, content);
  }

  /**
   * Create a directory
   */
  createDirectory(dirPath: string): void {
    createDirectory(dirPath);
  }

  /**
   * Delete a file or directory
   */
  delete(targetPath: string): void {
    deletePath(targetPath);
  }

  /**
   * List files in a directory
   */
  list(dirPath: string): string[] {
    return listFiles(dirPath);
  }

  /**
   * Read a JSON file
   */
  readJson(filePath: string): unknown {
    return readJsonFile(filePath);
  }

  /**
   * Write to a JSON file
   */
  writeJson(filePath: string, data: unknown): void {
    writeJsonFile(filePath, data);
  }

  /**
   * Get file size
   */
  getSize(filePath: string): number {
    return getFileSize(filePath) ?? 0;
  }

  /**
   * Get file modified time
   */
  getModifiedTime(filePath: string): Date {
    return getFileModifiedTime(filePath) ?? new Date();
  }

  /**
   * Copy a file or directory
   */
  copy(source: string, destination: string): void {
    copyPath(source, destination);
  }

  /**
   * Copy a directory
   */
  copyDir(source: string, destination: string): void {
    copyDirectory(source, destination);
  }

  /**
   * Get home directory path
   */
  getHomeDir(): string {
    return getHomeDir();
  }

  /**
   * Get temp directory path
   */
  getTempDir(): string {
    return getTempDir();
  }

  /**
   * Get system information
   */
  getSystemInfo(): ReturnType<typeof getSystemInfo> {
    return getSystemInfo();
  }

  /**
   * Read file with error handling
   */
  readSafe(filePath: string): FileResult<string> {
    try {
      const data = this.read(filePath);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Write file with error handling
   */
  writeSafe(filePath: string, content: string): FileResult<void> {
    try {
      this.write(filePath, content);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Keep static class for backward compatibility
export const FileService = {
  exists: fileExists,
  isFile: isFile,
  isDirectory: isDirectory,
  read: readFile,
  write: writeFile,
  createDirectory: createDirectory,
  delete: deletePath,
  list: listFiles,
  readJson: readJsonFile,
  writeJson: writeJsonFile,
  getSize: getFileSize,
  getModifiedTime: getFileModifiedTime,
  copy: copyPath,
  copyDir: copyDirectory,
  getHomeDir: getHomeDir,
  getTempDir: getTempDir,
  getSystemInfo: getSystemInfo,
};
