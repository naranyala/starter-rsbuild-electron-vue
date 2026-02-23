/**
 * File System API
 * Type-safe file system operations
 */

import { invoke } from './base.api';
import { IPC_CHANNELS } from '../../shared/ipc';

export interface ReadFileResult {
  content: string;
}

export interface WriteFileParams {
  filePath: string;
  content: string;
}

export interface ExistsResult {
  exists: boolean;
}

export interface MkdirParams {
  dirPath: string;
}

export interface ReaddirResult {
  files: string[];
}

export interface DeleteFileParams {
  filePath: string;
}

/**
 * Read file content
 */
export async function readFile(filePath: string): Promise<string> {
  return invoke<string>(IPC_CHANNELS.FILE.READ, filePath);
}

/**
 * Write content to file
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  return invoke<void>(IPC_CHANNELS.FILE.WRITE, filePath, content);
}

/**
 * Check if file exists
 */
export async function exists(filePath: string): Promise<boolean> {
  return invoke<boolean>(IPC_CHANNELS.FILE.EXISTS, filePath);
}

/**
 * Create directory
 */
export async function mkdir(dirPath: string): Promise<void> {
  return invoke<void>(IPC_CHANNELS.FILE.MKDIR, dirPath);
}

/**
 * Read directory contents
 */
export async function readdir(dirPath: string): Promise<string[]> {
  return invoke<string[]>(IPC_CHANNELS.FILE.READDIR, dirPath);
}

/**
 * Delete file
 */
export async function deleteFile(filePath: string): Promise<void> {
  return invoke<void>(IPC_CHANNELS.FILE.DELETE_FILE, filePath);
}

export const fileSystemAPI = {
  readFile,
  writeFile,
  exists,
  mkdir,
  readdir,
  deleteFile,
};
