/**
 * Frontend Window Service
 * Provides window management from the renderer process
 */

import type { IPCService } from '../di/tokens';

/**
 * Service for window operations from renderer process
 */
export class FrontendWindowServiceInstance {
  constructor(private ipc: IPCService) {}

  /**
   * Minimize the current window
   */
  async minimize(): Promise<void> {
    await this.ipc.invoke<void>('window:minimize');
  }

  /**
   * Maximize/unmaximize the current window
   */
  async maximize(): Promise<void> {
    await this.ipc.invoke<void>('window:maximize');
  }

  /**
   * Close the current window
   */
  async close(): Promise<void> {
    await this.ipc.invoke<void>('window:close');
  }

  /**
   * Check if window is maximized
   */
  async isMaximized(): Promise<boolean> {
    return this.ipc.invoke<boolean>('window:isMaximized');
  }

  /**
   * Listen for window minimize events
   */
  onMinimize(callback: () => void): () => void {
    return this.ipc.on('window:minimized', callback);
  }

  /**
   * Listen for window maximize events
   */
  onMaximize(callback: () => void): () => void {
    return this.ipc.on('window:maximized', callback);
  }

  /**
   * Listen for window close events
   */
  onClose(callback: () => void): () => void {
    return this.ipc.on('window:closed', callback);
  }
}
