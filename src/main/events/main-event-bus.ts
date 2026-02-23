/**
 * Main Process Event Bus
 * Extends shared EventBus with Electron-specific features
 */

import { EventBus, getSharedEventBus } from '../../shared/events/event-bus';
import type { EventBusConfig, EventData } from '../../shared/events/types';
import { IPC_CHANNELS } from '../../shared/ipc';
import type { IpcMain } from 'electron';

/**
 * Main process event bus configuration
 */
export interface MainEventBusConfig extends EventBusConfig {
  /** IPC channel for cross-process events */
  ipcChannel?: string;
  /** Forward events to renderer */
  forwardToRenderer?: boolean;
}

/**
 * Main Process Event Bus
 * 
 * Features:
 * - All shared EventBus features
 * - IPC bridge to renderer process
 * - Electron app lifecycle integration
 * - Window-specific event scoping
 */
export class MainEventBus extends EventBus {
  private ipcMain?: IpcMain;
  private forwardToRenderer: boolean;
  private ipcChannel: string;

  constructor(config: MainEventBusConfig = {}) {
    super({
      name: config.name ?? 'main',
      debug: config.debug ?? false,
      maxHistory: config.maxHistory ?? 100,
    });

    this.ipcChannel = config.ipcChannel ?? 'event-bus:main';
    this.forwardToRenderer = config.forwardToRenderer ?? false;
  }

  /**
   * Initialize with Electron IPC
   */
  initialize(ipcMain: IpcMain): void {
    this.ipcMain = ipcMain;
    this.setupIpcListener();
    this.log('initialized', 'Main event bus initialized with IPC');
  }

  /**
   * Emit an event with optional cross-process forwarding
   */
  async emit<TPayload = unknown>(
    event: string,
    payload?: TPayload,
    options?: { forwardToRenderer?: boolean }
  ): Promise<void> {
    const shouldForward = options?.forwardToRenderer ?? this.forwardToRenderer;

    // Emit locally
    await super.emit(event, payload);

    // Forward to renderer if enabled
    if (shouldForward && this.ipcMain) {
      this.forwardToRenderers(event, payload);
    }
  }

  /**
   * Subscribe to cross-process events from renderer
   */
  private setupIpcListener(): void {
    if (!this.ipcMain) return;

    const channel = `${this.ipcChannel}:emit`;
    
    this.ipcMain.handle(channel, async (event, data: { event: string; payload: unknown }) => {
      const { event: eventName, payload } = data;
      
      this.log('ipc-receive', eventName, {
        fromWindowId: event.sender.id,
        payload,
      });

      // Add source information
      const enrichedPayload = Object.assign({}, payload, {
        _source: {
          process: 'renderer' as const,
          windowId: event.sender.id,
        },
      });

      await super.emit(eventName, enrichedPayload);
      return { success: true };
    });

    this.log('ipc-listener-setup', channel);
  }

  /**
   * Forward event to all renderer windows
   */
  private forwardToRenderers<TPayload>(event: string, payload?: TPayload): void {
    if (!this.ipcMain) return;

    const { BrowserWindow } = require('electron') as typeof import('electron');
    const windows = BrowserWindow.getAllWindows();

    const message = {
      event,
      payload,
      source: 'main',
      timestamp: Date.now(),
    };

    for (const window of windows) {
      if (!window.isDestroyed()) {
        window.webContents.send(`${this.ipcChannel}:receive`, message);
      }
    }

    this.log('forward-to-renderers', event, { windowCount: windows.length });
  }

  /**
   * Forward event to specific window
   */
  forwardToWindow<TPayload>(
    windowId: number,
    event: string,
    payload?: TPayload
  ): void {
    if (!this.ipcMain) return;

    const { BrowserWindow } = require('electron') as typeof import('electron');
    const window = BrowserWindow.fromId(windowId);

    if (window && !window.isDestroyed()) {
      window.webContents.send(`${this.ipcChannel}:receive`, {
        event,
        payload,
        source: 'main',
        timestamp: Date.now(),
      });
      this.log('forward-to-window', event, { windowId });
    }
  }

  /**
   * Get main process event bus instance
   */
  static getInstance(config?: MainEventBusConfig): MainEventBus {
    const shared = getSharedEventBus({
      name: config?.name ?? 'main',
      debug: config?.debug,
      maxHistory: config?.maxHistory,
    });

    // If the shared instance is already a MainEventBus, return it
    if (shared instanceof MainEventBus) {
      return shared;
    }

    // Create new main event bus
    const mainBus = new MainEventBus(config);
    return mainBus;
  }

  protected log(action: string, message: string, data?: unknown): void {
    const debug = true; // Could be configurable
    if (!debug) return;
    console.log(`[MainEventBus] ${action}: ${message}`, data ?? '');
  }
}

/**
 * Global main event bus instance
 */
let mainEventBus: MainEventBus | null = null;

export function getMainEventBus(config?: MainEventBusConfig): MainEventBus {
  if (!mainEventBus) {
    mainEventBus = new MainEventBus(config);
  }
  return mainEventBus;
}

export function resetMainEventBus(): void {
  if (mainEventBus) {
    mainEventBus.removeAllListeners();
    mainEventBus = null;
  }
}
