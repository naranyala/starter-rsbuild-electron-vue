/**
 * Composable for IPC operations
 */

import { useInject } from './useInject';
import { IPC_SERVICE_TOKEN } from '../di';

/**
 * Composable for IPC communication
 */
export function useIPC() {
  const ipc = useInject(IPC_SERVICE_TOKEN);

  /**
   * Invoke a handler in the main process
   */
  const invoke = async <T>(channel: string, ...args: unknown[]): Promise<T> => {
    return ipc.invoke<T>(channel, ...args);
  };

  /**
   * Send a message to the main process
   */
  const send = (channel: string, ...args: unknown[]): void => {
    ipc.send(channel, ...args);
  };

  /**
   * Listen for events
   */
  const on = (channel: string, callback: (...args: unknown[]) => void): (() => void) => {
    return ipc.on(channel, callback);
  };

  /**
   * Listen for a one-time event
   */
  const once = (channel: string, callback: (...args: unknown[]) => void): (() => void) => {
    return ipc.once(channel, callback);
  };

  return {
    invoke,
    send,
    on,
    once,
  };
}
