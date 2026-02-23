/**
 * Application API
 * Type-safe application operations
 */

import { invoke, send } from './base.api';
import { IPC_CHANNELS } from '../../shared/ipc';

export interface AppInfo {
  version: string;
  name: string;
  platform: string;
  arch: string;
}

/**
 * Get application version
 */
export async function getVersion(): Promise<string> {
  return invoke<string>(IPC_CHANNELS.APP.GET_VERSION);
}

/**
 * Get application name
 */
export async function getName(): Promise<string> {
  return invoke<string>(IPC_CHANNELS.APP.GET_NAME);
}

/**
 * Get system path
 */
export async function getPath(name: string): Promise<string> {
  return invoke<string>(IPC_CHANNELS.APP.GET_PATH, name);
}

/**
 * Get application info
 */
export async function getInfo(): Promise<AppInfo> {
  return invoke<AppInfo>(IPC_CHANNELS.APP.GET_INFO);
}

/**
 * Quit application
 */
export function quit(): void {
  send(IPC_CHANNELS.APP.QUIT);
}

/**
 * Focus application window
 */
export function focus(): void {
  send(IPC_CHANNELS.APP.FOCUS);
}

/**
 * Set badge count (macOS)
 */
export function setBadgeCount(count: number): void {
  send(IPC_CHANNELS.APP.SET_BADGE_COUNT, count);
}

export const appAPI = {
  getVersion,
  getName,
  getPath,
  getInfo,
  quit,
  focus,
  setBadgeCount,
};
