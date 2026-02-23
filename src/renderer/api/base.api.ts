/**
 * Base API Client
 * Provides type-safe IPC communication for renderer process
 */

import type { IpcResult } from '../../shared/ipc';
import { IPC_CHANNELS } from '../../shared/ipc';
import { Err, isErr, isOk, Ok, type Result } from '../../shared/result';

function getElectronAPI() {
  const win = window as typeof window & {
    electronAPI?: {
      ipc: {
        invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
        send: (channel: string, ...args: unknown[]) => void;
        on: (
          channel: string,
          listener: (...args: unknown[]) => void
        ) => () => void;
        once: (
          channel: string,
          listener: (...args: unknown[]) => void
        ) => () => void;
        removeAllListeners: (channel: string) => void;
      };
    };
  };

  if (!win.electronAPI) {
    throw new Error(
      'electronAPI is not available. Ensure preload script is loaded.'
    );
  }
  return win.electronAPI;
}

export async function invoke<T>(
  channel: string,
  ...args: unknown[]
): Promise<T> {
  const electronAPI = getElectronAPI();

  try {
    const result: IpcResult<T> = (await electronAPI.ipc.invoke(
      channel,
      ...args
    )) as IpcResult<T>;

    if (!result.success) {
      throw new Error(result.error ?? 'Unknown error');
    }

    return result.data as T;
  } catch (error) {
    console.error(`IPC invoke failed on channel: ${channel}`, error);
    throw error;
  }
}

export async function invokeSafe<T>(
  channel: string,
  ...args: unknown[]
): Promise<Result<T, Error>> {
  const electronAPI = getElectronAPI();

  try {
    const result: IpcResult<T> = (await electronAPI.ipc.invoke(
      channel,
      ...args
    )) as IpcResult<T>;

    if (!result.success) {
      return Err(new Error(result.error ?? 'Unknown error'));
    }

    return Ok(result.data as T);
  } catch (error) {
    console.error(`IPC invoke failed on channel: ${channel}`, error);
    return Err(error instanceof Error ? error : new Error(String(error)));
  }
}

export function send(channel: string, ...args: unknown[]): void {
  const electronAPI = getElectronAPI();
  electronAPI.ipc.send(channel, ...args);
}

export function on(
  channel: string,
  listener: (...args: unknown[]) => void
): () => void {
  const electronAPI = getElectronAPI();
  return electronAPI.ipc.on(channel, listener);
}

export function once(
  channel: string,
  listener: (...args: unknown[]) => void
): () => void {
  const electronAPI = getElectronAPI();
  return electronAPI.ipc.once(channel, listener);
}

export function removeAllListeners(channel: string): void {
  const electronAPI = getElectronAPI();
  electronAPI.ipc.removeAllListeners(channel);
}

export type { Result } from '../../shared/result';
export { Err, isErr, isOk, Ok } from '../../shared/result';
