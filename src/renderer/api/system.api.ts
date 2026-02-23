/**
 * System API
 * Type-safe system operations with "errors as values" pattern
 */

import { IPC_CHANNELS } from '../../shared/ipc';
import { invoke, invokeSafe, type Result, send } from './base.api';

export interface SystemInfo {
  platform: string;
  arch: string;
  release: string;
  hostname: string;
  totalMemory: number;
  freeMemory: number;
  homeDir: string;
  tempDir: string;
}

export async function getPlatform(): Promise<NodeJS.Platform> {
  return invoke<NodeJS.Platform>(IPC_CHANNELS.SYSTEM.GET_PLATFORM);
}

export async function safeGetPlatform(): Promise<
  Result<NodeJS.Platform, Error>
> {
  return invokeSafe<NodeJS.Platform>(IPC_CHANNELS.SYSTEM.GET_PLATFORM);
}

export async function getArch(): Promise<string> {
  return invoke<string>(IPC_CHANNELS.SYSTEM.GET_ARCH);
}

export async function safeGetArch(): Promise<Result<string, Error>> {
  return invokeSafe<string>(IPC_CHANNELS.SYSTEM.GET_ARCH);
}

export async function getSystemInfo(): Promise<SystemInfo> {
  return invoke<SystemInfo>(IPC_CHANNELS.SYSTEM.GET_INFO);
}

export async function safeGetSystemInfo(): Promise<Result<SystemInfo, Error>> {
  return invokeSafe<SystemInfo>(IPC_CHANNELS.SYSTEM.GET_INFO);
}

export async function showInFolder(fullPath: string): Promise<void> {
  return invoke<void>(IPC_CHANNELS.SYSTEM.SHOW_IN_FOLDER, fullPath);
}

export async function safeShowInFolder(
  fullPath: string
): Promise<Result<void, Error>> {
  return invokeSafe<void>(IPC_CHANNELS.SYSTEM.SHOW_IN_FOLDER, fullPath);
}

export async function openExternal(url: string): Promise<void> {
  return invoke<void>(IPC_CHANNELS.SYSTEM.OPEN_EXTERNAL, url);
}

export async function safeOpenExternal(
  url: string
): Promise<Result<void, Error>> {
  return invokeSafe<void>(IPC_CHANNELS.SYSTEM.OPEN_EXTERNAL, url);
}

export const systemAPI = {
  getPlatform,
  safeGetPlatform,
  getArch,
  safeGetArch,
  getSystemInfo,
  safeGetSystemInfo,
  showInFolder,
  safeShowInFolder,
  openExternal,
  safeOpenExternal,
};
