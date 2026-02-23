/**
 * System API
 * Type-safe system operations
 */

import { invoke, send } from './base.api';
import { IPC_CHANNELS } from '../../shared/ipc';

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

/**
 * Get platform
 */
export async function getPlatform(): Promise<NodeJS.Platform> {
  return invoke<NodeJS.Platform>(IPC_CHANNELS.SYSTEM.GET_PLATFORM);
}

/**
 * Get architecture
 */
export async function getArch(): Promise<string> {
  return invoke<string>(IPC_CHANNELS.SYSTEM.GET_ARCH);
}

/**
 * Get system info
 */
export async function getSystemInfo(): Promise<SystemInfo> {
  return invoke<SystemInfo>(IPC_CHANNELS.SYSTEM.GET_INFO);
}

/**
 * Show item in folder (opens file explorer)
 */
export async function showInFolder(fullPath: string): Promise<void> {
  return invoke<void>(IPC_CHANNELS.SYSTEM.SHOW_IN_FOLDER, fullPath);
}

/**
 * Open external URL
 */
export async function openExternal(url: string): Promise<void> {
  return invoke<void>(IPC_CHANNELS.SYSTEM.OPEN_EXTERNAL, url);
}

export const systemAPI = {
  getPlatform,
  getArch,
  getSystemInfo,
  showInFolder,
  openExternal,
};
