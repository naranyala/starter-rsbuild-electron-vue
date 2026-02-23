/**
 * File System API
 * Type-safe file system operations with "errors as values" pattern
 */

import { IPC_CHANNELS } from '../../shared/ipc';
import { invoke, invokeSafe, type Result } from './base.api';

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

export async function readFile(filePath: string): Promise<string> {
  return invoke<string>(IPC_CHANNELS.FILE.READ, filePath);
}

export async function safeReadFile(
  filePath: string
): Promise<Result<string, Error>> {
  return invokeSafe<string>(IPC_CHANNELS.FILE.READ, filePath);
}

export async function writeFile(
  filePath: string,
  content: string
): Promise<void> {
  return invoke<void>(IPC_CHANNELS.FILE.WRITE, filePath, content);
}

export async function safeWriteFile(
  filePath: string,
  content: string
): Promise<Result<void, Error>> {
  return invokeSafe<void>(IPC_CHANNELS.FILE.WRITE, filePath, content);
}

export async function exists(filePath: string): Promise<boolean> {
  return invoke<boolean>(IPC_CHANNELS.FILE.EXISTS, filePath);
}

export async function safeExists(
  filePath: string
): Promise<Result<boolean, Error>> {
  return invokeSafe<boolean>(IPC_CHANNELS.FILE.EXISTS, filePath);
}

export async function mkdir(dirPath: string): Promise<void> {
  return invoke<void>(IPC_CHANNELS.FILE.MKDIR, dirPath);
}

export async function safeMkdir(dirPath: string): Promise<Result<void, Error>> {
  return invokeSafe<void>(IPC_CHANNELS.FILE.MKDIR, dirPath);
}

export async function readdir(dirPath: string): Promise<string[]> {
  return invoke<string[]>(IPC_CHANNELS.FILE.READDIR, dirPath);
}

export async function safeReaddir(
  dirPath: string
): Promise<Result<string[], Error>> {
  return invokeSafe<string[]>(IPC_CHANNELS.FILE.READDIR, dirPath);
}

export async function deleteFile(filePath: string): Promise<void> {
  return invoke<void>(IPC_CHANNELS.FILE.DELETE_FILE, filePath);
}

export async function safeDeleteFile(
  filePath: string
): Promise<Result<void, Error>> {
  return invokeSafe<void>(IPC_CHANNELS.FILE.DELETE_FILE, filePath);
}

export const fileSystemAPI = {
  readFile,
  safeReadFile,
  writeFile,
  safeWriteFile,
  exists,
  safeExists,
  mkdir,
  safeMkdir,
  readdir,
  safeReaddir,
  deleteFile,
  safeDeleteFile,
};
