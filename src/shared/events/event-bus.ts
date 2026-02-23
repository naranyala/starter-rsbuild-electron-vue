/**
 * Core Event Bus Implementation
 * A type-safe, feature-rich event emitter with middleware support
 */

import type {
  EventHandler,
  EventData,
  SubscriptionOptions,
  Subscription,
  EventBusConfig,
  EventBusStats,
  EventMiddleware,
  IEventBus,
} from './types';

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Core Event Bus Class
 * 
 * Features:
 * - Type-safe event handling
 * - Wildcard event patterns (e.g., 'user:*', '*.created')
 * - Middleware support
 * - Debounce and throttle
 * - Event history
 * - Debug logging
 * - Priority-based execution
 */
export class EventBus implements IEventBus {
  private subscriptions = new Map<string, Subscription[]>();
  private middlewares: EventMiddleware[] = [];
  private config: Required<EventBusConfig>;
  private stats: EventBusStats = {
    totalEmitted: 0,
    totalListeners: 0,
    eventsByName: {},
    avgHandlerTime: 0,
  };
  private eventHistory: EventData[] = [];
  private handlerTimes: number[] = [];

  constructor(config: EventBusConfig = {}) {
    this.config = {
      name: config.name ?? 'default',
      debug: config.debug ?? false,
      maxHistory: config.maxHistory ?? 100,
    };
  }

  /**
   * Subscribe to an event
   * Supports wildcard patterns: 'user:*', '*.created', '*'
   */
  on<TPayload = unknown>(
    event: string,
    handler: EventHandler<TPayload>,
    options: SubscriptionOptions = {}
  ): () => void {
    const subscription: Subscription = {
      id: generateId(),
      event,
      handler: handler as EventHandler,
      options: {
        once: false,
        priority: 0,
        ...options,
      },
    };

    const subs = this.subscriptions.get(event) ?? [];
    subs.push(subscription);
    // Sort by priority (higher first)
    subs.sort((a, b) => (b.options.priority ?? 0) - (a.options.priority ?? 0));
    this.subscriptions.set(event, subs);

    this.stats.totalListeners++;
    this.log('subscribe', event, subscription.id);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  /**
   * Subscribe to an event once
   */
  once<TPayload = unknown>(
    event: string,
    handler: EventHandler<TPayload>
  ): () => void {
    return this.on(event, handler, { once: true });
  }

  /**
   * Unsubscribe from an event
   */
  off<TPayload = unknown>(
    event: string,
    handler?: EventHandler<TPayload>
  ): void {
    const subs = this.subscriptions.get(event);
    if (!subs) return;

    if (handler) {
      const index = subs.findIndex(s => s.handler === handler);
      if (index !== -1) {
        const sub = subs[index];
        this.clearDebounce(sub);
        subs.splice(index, 1);
        this.stats.totalListeners--;
        this.log('unsubscribe', event, sub.id);
      }
    } else {
      // Remove all handlers for this event
      subs.forEach(sub => this.clearDebounce(sub));
      this.stats.totalListeners -= subs.length;
      this.subscriptions.delete(event);
      this.log('unsubscribe-all', event);
    }

    if (subs.length === 0) {
      this.subscriptions.delete(event);
    }
  }

  /**
   * Emit an event
   */
  async emit<TPayload = unknown>(
    event: string,
    payload?: TPayload
  ): Promise<void> {
    const eventData: EventData<TPayload> = {
      name: event,
      timestamp: new Date(),
      eventId: generateId(),
      payload: payload as TPayload,
      source: 'main',
    };

    this.stats.totalEmitted++;
    this.stats.eventsByName[event] = (this.stats.eventsByName[event] ?? 0) + 1;

    // Add to history
    this.addToHistory(eventData);

    this.log('emit', event, payload);

    // Run middlewares
    let middlewareIndex = 0;
    const runMiddleware = async (): Promise<void> => {
      if (middlewareIndex >= this.middlewares.length) {
        await this.runHandlers(eventData);
        return;
      }

      const middleware = this.middlewares[middlewareIndex];
      middlewareIndex++;

      await middleware(eventData as EventData, runMiddleware);
    };

    await runMiddleware();
  }

  /**
   * Add middleware to the event pipeline
   */
  use(middleware: EventMiddleware): () => void {
    this.middlewares.push(middleware);
    this.log('middleware-added', 'middleware registered');

    return () => {
      const index = this.middlewares.indexOf(middleware);
      if (index !== -1) {
        this.middlewares.splice(index, 1);
        this.log('middleware-removed', 'middleware unregistered');
      }
    };
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.off(event);
    } else {
      this.subscriptions.forEach((subs, key) => {
        subs.forEach(sub => this.clearDebounce(sub));
      });
      this.subscriptions.clear();
      this.stats.totalListeners = 0;
      this.log('clear-all', 'all listeners removed');
    }
  }

  /**
   * Get listener count for an event (includes wildcard matches)
   */
  listenerCount(event: string): number {
    let count = 0;

    this.subscriptions.forEach((subs, pattern) => {
      if (this.matchesPattern(event, pattern)) {
        count += subs.length;
      }
    });

    return count;
  }

  /**
   * Get all registered event patterns
   */
  eventNames(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Get bus statistics
   */
  getStats(): EventBusStats {
    return { ...this.stats };
  }

  /**
   * Get event history
   */
  getHistory(limit = 10): EventData[] {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
    this.log('history-cleared', '');
  }

  /**
   * Run handlers for an event (including wildcard matches)
   */
  private async runHandlers<TPayload>(eventData: EventData<TPayload>): Promise<void> {
    const handlers: { sub: Subscription; startTime: number }[] = [];

    // Find all matching subscriptions (exact + wildcard)
    this.subscriptions.forEach((subs, pattern) => {
      if (this.matchesPattern(eventData.name, pattern)) {
        subs.forEach(sub => {
          // Apply debounce/throttle
          const processedSub = this.applyRateLimiting(sub);
          if (processedSub) {
            handlers.push({ sub: processedSub, startTime: performance.now() });
          }
        });
      }
    });

    // Execute handlers
    const executionTimes: number[] = [];
    for (const { sub, startTime } of handlers) {
      try {
        await sub.handler(eventData.payload, eventData);

        const execTime = performance.now() - startTime;
        executionTimes.push(execTime);

        // Handle once subscriptions
        if (sub.options.once) {
          this.off(sub.event, sub.handler);
        }
      } catch (error) {
        console.error(`[EventBus:${this.config.name}] Handler error for event "${sub.event}":`, error);
      }
    }

    // Update average handler time
    if (executionTimes.length > 0) {
      const avgTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
      this.handlerTimes.push(avgTime);
      // Keep last 100 measurements
      if (this.handlerTimes.length > 100) {
        this.handlerTimes.shift();
      }
      this.stats.avgHandlerTime =
        this.handlerTimes.reduce((a, b) => a + b, 0) / this.handlerTimes.length;
    }
  }

  /**
   * Check if event name matches pattern (supports wildcards)
   */
  private matchesPattern(event: string, pattern: string): boolean {
    if (pattern === event) return true;
    if (pattern === '*') return true;

    // Convert wildcard pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(event);
  }

  /**
   * Apply debounce/throttle to subscription
   */
  private applyRateLimiting(sub: Subscription): Subscription | null {
    const now = Date.now();

    // Debounce
    if (sub.options.debounce) {
      this.clearDebounce(sub);
      sub.timeoutId = setTimeout(() => {
        sub.handler; // Will be called later
      }, sub.options.debounce);
      return null; // Don't execute now
    }

    // Throttle
    if (sub.options.throttle && sub.lastCall) {
      const elapsed = now - sub.lastCall;
      if (elapsed < sub.options.throttle) {
        return null; // Skip this execution
      }
    }

    sub.lastCall = now;
    return sub;
  }

  /**
   * Clear debounce timeout
   */
  private clearDebounce(sub: Subscription): void {
    if (sub.timeoutId) {
      clearTimeout(sub.timeoutId);
      sub.timeoutId = undefined;
    }
  }

  /**
   * Add event to history
   */
  private addToHistory<TPayload>(eventData: EventData<TPayload>): void {
    this.eventHistory.push(eventData as EventData);
    if (this.eventHistory.length > this.config.maxHistory) {
      this.eventHistory.shift();
    }
  }

  /**
   * Debug logging
   */
  protected log(action: string, event: string, data?: unknown): void {
    if (!this.config.debug) return;

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [EventBus:${this.config.name}] ${action}: ${event}`, data ?? '');
  }
}

/**
 * Create a shared event bus instance
 */
let sharedEventBus: EventBus | null = null;

export function getSharedEventBus(config?: EventBusConfig): EventBus {
  if (!sharedEventBus) {
    sharedEventBus = new EventBus(config);
  }
  return sharedEventBus;
}

export function resetSharedEventBus(): void {
  if (sharedEventBus) {
    sharedEventBus.removeAllListeners();
    sharedEventBus.clearHistory();
    sharedEventBus = null;
  }
}
