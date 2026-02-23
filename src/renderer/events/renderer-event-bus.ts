/**
 * Renderer Process Event Bus
 * Extends shared EventBus with Electron renderer-specific features
 */

import { EventBus, getSharedEventBus } from '../../shared/events/event-bus';
import type { EventBusConfig } from '../../shared/events/types';

/**
 * Electron API type from preload
 */
interface ElectronAPI {
  ipc: {
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
    send: (channel: string, ...args: unknown[]) => void;
    on: (channel: string, listener: (...args: unknown[]) => void) => () => void;
    once: (
      channel: string,
      listener: (...args: unknown[]) => void
    ) => () => void;
    removeAllListeners: (channel: string) => void;
  };
}

/**
 * Renderer process event bus configuration
 */
export interface RendererEventBusConfig extends EventBusConfig {
  /** IPC channel for cross-process events */
  ipcChannel?: string;
  /** Forward events to main process */
  forwardToMain?: boolean;
}

/**
 * Renderer Process Event Bus
 *
 * Features:
 * - All shared EventBus features
 * - IPC bridge to main process
 * - Vue integration helpers
 * - Component lifecycle awareness
 */
export class RendererEventBus extends EventBus {
  private forwardToMain: boolean;
  private ipcChannel: string;
  private electronAPI?: ElectronAPI;

  constructor(config: RendererEventBusConfig = {}) {
    super({
      name: config.name ?? 'renderer',
      debug: config.debug ?? false,
      maxHistory: config.maxHistory ?? 100,
    });

    this.ipcChannel = config.ipcChannel ?? 'event-bus:renderer';
    this.forwardToMain = config.forwardToMain ?? false;

    // Get electron API if available
    const win = window as typeof window & { electronAPI?: ElectronAPI };
    if (win.electronAPI) {
      this.electronAPI = win.electronAPI;
    }
  }

  /**
   * Emit an event with optional cross-process forwarding
   */
  async emit<TPayload = unknown>(
    event: string,
    payload?: TPayload,
    options?: { forwardToMain?: boolean }
  ): Promise<void> {
    const shouldForward = options?.forwardToMain ?? this.forwardToMain;

    // Emit locally
    await super.emit(event, payload);

    // Forward to main process if enabled
    if (shouldForward && this.electronAPI) {
      await this.forwardToMainProcess(event, payload);
    }
  }

  /**
   * Forward event to main process via IPC
   */
  private async forwardToMainProcess<TPayload>(
    event: string,
    payload?: TPayload
  ): Promise<void> {
    if (!this.electronAPI) return;

    try {
      const channel = `${this.ipcChannel}:emit`;
      await this.electronAPI.ipc.invoke(channel, { event, payload });
      this.log('forward-to-main', event);
    } catch (error) {
      console.error('[RendererEventBus] Failed to forward to main:', error);
    }
  }

  /**
   * Setup listener for events from main process
   */
  setupMainProcessListener(): () => void {
    if (!this.electronAPI) {
      this.log('setup-listener', 'electronAPI not available');
      return () => {};
    }

    const channel = `${this.ipcChannel}:receive`;

    const unsubscribe = this.electronAPI.ipc.on(
      channel,
      (...args: unknown[]) => {
        const data = args[0] as {
          event: string;
          payload: unknown;
          source: string;
          timestamp: number;
        };
        const { event, payload } = data;

        this.log('receive-from-main', event, { source: data.source });

        // Emit locally with source information
        const enrichedPayload = Object.assign({}, payload, {
          _source: {
            process: 'main' as const,
            timestamp: data.timestamp,
          },
        });

        // Use super.emit to avoid infinite loop
        void super.emit(event, enrichedPayload);
      }
    );

    this.log('setup-listener', `Listening on ${channel}`);
    return unsubscribe;
  }

  /**
   * Create a scoped event bus for a component
   * Automatically cleans up on dispose
   */
  createComponentScope(componentName: string): ScopedEventBus {
    return new ScopedEventBus(this, componentName);
  }

  /**
   * Get renderer event bus instance
   */
  static getInstance(config?: RendererEventBusConfig): RendererEventBus {
    const shared = getSharedEventBus({
      name: config?.name ?? 'renderer',
      debug: config?.debug,
      maxHistory: config?.maxHistory,
    });

    // If the shared instance is already a RendererEventBus, return it
    if (shared instanceof RendererEventBus) {
      return shared;
    }

    // Create new renderer event bus
    const rendererBus = new RendererEventBus(config);
    return rendererBus;
  }

  protected log(action: string, message: string, data?: unknown): void {
    const debug = false; // Could be configurable
    if (!debug) return;
    console.log(`[RendererEventBus] ${action}: ${message}`, data ?? '');
  }
}

/**
 * Scoped Event Bus for component lifecycle management
 */
export class ScopedEventBus {
  private parent: RendererEventBus;
  private scopePrefix: string;
  private subscriptions: Array<() => void> = [];

  constructor(parent: RendererEventBus, componentName: string) {
    this.parent = parent;
    this.scopePrefix = `${componentName}:`;
  }

  /**
   * Subscribe to an event within this scope
   */
  on<TPayload = unknown>(
    event: string,
    handler: (payload: TPayload) => void | Promise<void>
  ): () => void {
    const scopedEvent = this.scopePrefix + event;
    const unsubscribe = this.parent.on(
      scopedEvent,
      handler as (
        payload: TPayload,
        event: { name: string; payload: TPayload }
      ) => void
    );
    this.subscriptions.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Emit an event within this scope
   */
  emit<TPayload = unknown>(event: string, payload?: TPayload): Promise<void> {
    const scopedEvent = this.scopePrefix + event;
    return this.parent.emit(scopedEvent, payload);
  }

  /**
   * Dispose all subscriptions in this scope
   */
  dispose(): void {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
  }
}

/**
 * Global renderer event bus instance
 */
let rendererEventBus: RendererEventBus | null = null;

export function getRendererEventBus(
  config?: RendererEventBusConfig
): RendererEventBus {
  if (!rendererEventBus) {
    rendererEventBus = new RendererEventBus(config);
  }
  return rendererEventBus;
}

export function resetRendererEventBus(): void {
  if (rendererEventBus) {
    rendererEventBus.setupMainProcessListener();
    rendererEventBus.removeAllListeners();
    rendererEventBus = null;
  }
}
