/**
 * IPC Service for Electron renderer process
 * Provides type-safe IPC communication with the main process
 */

/**
 * Service for Electron IPC communication from renderer process
 */
export class IPCServiceInstance {
  private listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  /**
   * Invoke a handler in the main process
   */
  async invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
    if (!this.isElectron()) {
      console.warn(`IPC invoke called outside Electron: ${channel}`);
      return Promise.reject(new Error('Not running in Electron'));
    }

    const { ipcRenderer } = window.require('electron');
    return ipcRenderer.invoke(channel, ...args);
  }

  /**
   * Send a message to the main process (fire-and-forget)
   */
  send(channel: string, ...args: unknown[]): void {
    if (!this.isElectron()) {
      console.warn(`IPC send called outside Electron: ${channel}`);
      return;
    }

    const { ipcRenderer } = window.require('electron');
    ipcRenderer.send(channel, ...args);
  }

  /**
   * Listen for events from the main process
   * Returns an unsubscribe function
   */
  on(channel: string, callback: (...args: unknown[]) => void): () => void {
    if (!this.isElectron()) {
      console.warn(`IPC on called outside Electron: ${channel}`);
      return () => {};
    }

    const { ipcRenderer } = window.require('electron');

    // Wrap callback to track it
    const wrappedCallback = (
      _event: Electron.IpcRendererEvent,
      ...args: unknown[]
    ) => {
      callback(...args);
    };

    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(callback);

    ipcRenderer.on(channel, wrappedCallback);

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener(channel, wrappedCallback);
      this.listeners.get(channel)?.delete(callback);
    };
  }

  /**
   * Listen for a one-time event from the main process
   * Returns an unsubscribe function
   */
  once(channel: string, callback: (...args: unknown[]) => void): () => void {
    if (!this.isElectron()) {
      console.warn(`IPC once called outside Electron: ${channel}`);
      return () => {};
    }

    const { ipcRenderer } = window.require('electron');

    const wrappedCallback = (
      _event: Electron.IpcRendererEvent,
      ...args: unknown[]
    ) => {
      callback(...args);
    };

    ipcRenderer.once(channel, wrappedCallback);

    return () => {
      ipcRenderer.removeListener(channel, wrappedCallback);
    };
  }

  /**
   * Remove all listeners for a channel
   */
  removeAllListeners(channel: string): void {
    if (!this.isElectron()) {
      return;
    }

    const { ipcRenderer } = window.require('electron');
    ipcRenderer.removeAllListeners(channel);
    this.listeners.delete(channel);
  }

  /**
   * Check if running in Electron renderer process
   */
  private isElectron(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof (window as unknown as { require?: unknown }).require === 'function'
    );
  }

  /**
   * Clean up all listeners
   */
  dispose(): void {
    for (const [channel, callbacks] of this.listeners.entries()) {
      this.removeAllListeners(channel);
    }
    this.listeners.clear();
  }
}

// Browser-safe IPC service (for web development)
export class BrowserIPCServiceInstance {
  private eventTarget = new EventTarget();

  async invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
    console.log(`[BrowserIPC] invoke: ${channel}`, args);
    // Simulate IPC delay
    await new Promise(resolve => setTimeout(resolve, 10));
    return `mock-${channel}` as T;
  }

  send(channel: string, ...args: unknown[]): void {
    console.log(`[BrowserIPC] send: ${channel}`, args);
    this.eventTarget.dispatchEvent(new CustomEvent(channel, { detail: args }));
  }

  on(channel: string, callback: (...args: unknown[]) => void): () => void {
    const handler = (event: Event) => {
      if (event instanceof CustomEvent) {
        callback(...(event.detail ?? []));
      }
    };

    this.eventTarget.addEventListener(channel, handler);

    return () => {
      this.eventTarget.removeEventListener(channel, handler);
    };
  }

  once(channel: string, callback: (...args: unknown[]) => void): () => void {
    const handler = (event: Event) => {
      if (event instanceof CustomEvent) {
        callback(...(event.detail ?? []));
      }
    };

    this.eventTarget.addEventListener(channel, handler, { once: true });

    return () => {
      this.eventTarget.removeEventListener(channel, handler);
    };
  }

  removeAllListeners(channel: string): void {
    // EventTarget doesn't support removeAllListeners, so we just log
    console.log(`[BrowserIPC] removeAllListeners: ${channel}`);
  }

  dispose(): void {
    this.eventTarget = new EventTarget();
  }
}
