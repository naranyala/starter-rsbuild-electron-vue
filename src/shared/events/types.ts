/**
 * Event Bus Core Types
 * Type-safe event system definitions
 */

/**
 * Event handler function type
 */
export type EventHandler<TPayload = unknown> = (payload: TPayload, event: EventData<TPayload>) => void | Promise<void>;

/**
 * Event metadata
 */
export interface EventData<TPayload = unknown> {
  /** Event name */
  name: string;
  /** Timestamp when event was emitted */
  timestamp: Date;
  /** Unique event ID */
  eventId: string;
  /** Event payload */
  payload: TPayload;
  /** Source process (main/renderer) */
  source?: 'main' | 'renderer';
}

/**
 * Event subscription options
 */
export interface SubscriptionOptions {
  /** Execute only once */
  once?: boolean;
  /** Event priority (higher = executed first) */
  priority?: number;
  /** Debounce time in ms */
  debounce?: number;
  /** Throttle time in ms */
  throttle?: number;
}

/**
 * Internal subscription record
 */
export interface Subscription {
  id: string;
  event: string;
  handler: EventHandler;
  options: SubscriptionOptions;
  lastCall?: number;
  timeoutId?: ReturnType<typeof setTimeout>;
}

/**
 * Event bus configuration
 */
export interface EventBusConfig {
  /** Bus name for debugging */
  name?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Maximum event history to keep */
  maxHistory?: number;
}

/**
 * Event bus statistics
 */
export interface EventBusStats {
  /** Total events emitted */
  totalEmitted: number;
  /** Total listeners */
  totalListeners: number;
  /** Events by name */
  eventsByName: Record<string, number>;
  /** Average handler execution time (ms) */
  avgHandlerTime?: number;
}

/**
 * Middleware function type
 */
export type EventMiddleware<TPayload = unknown> = (
  event: EventData<TPayload>,
  next: () => void | Promise<void>
) => void | Promise<void>;

/**
 * Event bus interface
 */
export interface IEventBus {
  /**
   * Subscribe to an event
   */
  on<TPayload = unknown>(
    event: string,
    handler: EventHandler<TPayload>,
    options?: SubscriptionOptions
  ): () => void;

  /**
   * Subscribe to an event once
   */
  once<TPayload = unknown>(
    event: string,
    handler: EventHandler<TPayload>
  ): () => void;

  /**
   * Unsubscribe from an event
   */
  off<TPayload = unknown>(
    event: string,
    handler?: EventHandler<TPayload>
  ): void;

  /**
   * Emit an event
   */
  emit<TPayload = unknown>(
    event: string,
    payload?: TPayload
  ): Promise<void>;

  /**
   * Remove all listeners
   */
  removeAllListeners(event?: string): void;

  /**
   * Get listener count for an event
   */
  listenerCount(event: string): number;

  /**
   * Get all registered events
   */
  eventNames(): string[];

  /**
   * Get bus statistics
   */
  getStats(): EventBusStats;
}
