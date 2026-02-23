/**
 * Window API
 * Type-safe window operations
 */

import { invoke, send } from './base.api';
import { IPC_CHANNELS } from '../../shared/ipc';

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Minimize window
 */
export function minimize(): void {
  send(IPC_CHANNELS.WINDOW.MINIMIZE);
}

/**
 * Maximize window
 */
export function maximize(): void {
  send(IPC_CHANNELS.WINDOW.MAXIMIZE);
}

/**
 * Close window
 */
export function closeWindow(): void {
  send(IPC_CHANNELS.WINDOW.CLOSE);
}

/**
 * Focus window
 */
export function focusWindow(): void {
  send(IPC_CHANNELS.WINDOW.FOCUS);
}

/**
 * Center window
 */
export function center(): void {
  send(IPC_CHANNELS.WINDOW.CENTER);
}

/**
 * Get window bounds
 */
export async function getBounds(): Promise<WindowBounds> {
  return invoke<WindowBounds>(IPC_CHANNELS.WINDOW.GET_BOUNDS);
}

/**
 * Set window bounds
 */
export async function setBounds(bounds: WindowBounds): Promise<void> {
  return invoke<void>(IPC_CHANNELS.WINDOW.SET_BOUNDS, bounds);
}

export const windowAPI = {
  minimize,
  maximize,
  closeWindow,
  focusWindow,
  center,
  getBounds,
  setBounds,
};
