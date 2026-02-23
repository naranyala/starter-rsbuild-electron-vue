/**
 * Window API
 * Type-safe window operations with "errors as values" pattern
 */

import { IPC_CHANNELS } from '../../shared/ipc';
import { invoke, invokeSafe, type Result, send } from './base.api';

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function minimize(): void {
  send(IPC_CHANNELS.WINDOW.MINIMIZE);
}

export function maximize(): void {
  send(IPC_CHANNELS.WINDOW.MAXIMIZE);
}

export function closeWindow(): void {
  send(IPC_CHANNELS.WINDOW.CLOSE);
}

export function focusWindow(): void {
  send(IPC_CHANNELS.WINDOW.FOCUS);
}

export function center(): void {
  send(IPC_CHANNELS.WINDOW.CENTER);
}

export async function getBounds(): Promise<WindowBounds> {
  return invoke<WindowBounds>(IPC_CHANNELS.WINDOW.GET_BOUNDS);
}

export async function safeGetBounds(): Promise<Result<WindowBounds, Error>> {
  return invokeSafe<WindowBounds>(IPC_CHANNELS.WINDOW.GET_BOUNDS);
}

export async function setBounds(bounds: WindowBounds): Promise<void> {
  return invoke<void>(IPC_CHANNELS.WINDOW.SET_BOUNDS, bounds);
}

export async function safeSetBounds(
  bounds: WindowBounds
): Promise<Result<void, Error>> {
  return invokeSafe<void>(IPC_CHANNELS.WINDOW.SET_BOUNDS, bounds);
}

export const windowAPI = {
  minimize,
  maximize,
  closeWindow,
  focusWindow,
  center,
  getBounds,
  safeGetBounds,
  setBounds,
  safeSetBounds,
};
