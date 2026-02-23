/**
 * Application API
 * Type-safe application operations with "errors as values" pattern
 */

import { IPC_CHANNELS } from '../../shared/ipc';
import { invoke, invokeSafe, type Result, send } from './base.api';

export interface AppInfo {
  version: string;
  name: string;
  platform: string;
  arch: string;
}

export async function getVersion(): Promise<string> {
  return invoke<string>(IPC_CHANNELS.APP.GET_VERSION);
}

export async function safeGetVersion(): Promise<Result<string, Error>> {
  return invokeSafe<string>(IPC_CHANNELS.APP.GET_VERSION);
}

export async function getName(): Promise<string> {
  return invoke<string>(IPC_CHANNELS.APP.GET_NAME);
}

export async function safeGetName(): Promise<Result<string, Error>> {
  return invokeSafe<string>(IPC_CHANNELS.APP.GET_NAME);
}

export async function getPath(name: string): Promise<string> {
  return invoke<string>(IPC_CHANNELS.APP.GET_PATH, name);
}

export async function safeGetPath(
  name: string
): Promise<Result<string, Error>> {
  return invokeSafe<string>(IPC_CHANNELS.APP.GET_PATH, name);
}

export async function getInfo(): Promise<AppInfo> {
  return invoke<AppInfo>(IPC_CHANNELS.APP.GET_INFO);
}

export async function safeGetInfo(): Promise<Result<AppInfo, Error>> {
  return invokeSafe<AppInfo>(IPC_CHANNELS.APP.GET_INFO);
}

export function quit(): void {
  send(IPC_CHANNELS.APP.QUIT);
}

export function focus(): void {
  send(IPC_CHANNELS.APP.FOCUS);
}

export function setBadgeCount(count: number): void {
  send(IPC_CHANNELS.APP.SET_BADGE_COUNT, count);
}

export const appAPI = {
  getVersion,
  safeGetVersion,
  getName,
  safeGetName,
  getPath,
  safeGetPath,
  getInfo,
  safeGetInfo,
  quit,
  focus,
  setBadgeCount,
};
