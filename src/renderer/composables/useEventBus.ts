/**
 * Vue Composable for Event Bus
 * Provides useEventBus composable for Vue 3 components
 */

import { getCurrentInstance, onMounted, onUnmounted } from 'vue';
import type {
  EventHandler,
  SubscriptionOptions,
} from '../../shared/events/types';
import {
  getRendererEventBus,
  type RendererEventBus,
} from '../events/renderer-event-bus';

export interface UseEventBusOptions {
  /** Auto-subscribe on mount and unsubscribe on unmount */
  autoSubscribe?: boolean;
  /** Component name for scoped events */
  scope?: string;
  /** Default subscription options */
  defaultOptions?: SubscriptionOptions;
}

/**
 * Event bus composable return type
 */
export interface UseEventBusReturn {
  /** The event bus instance */
  eventBus: RendererEventBus;
  /** Subscribe to an event */
  on: <TPayload = unknown>(
    event: string,
    handler: EventHandler<TPayload>,
    options?: SubscriptionOptions
  ) => () => void;
  /** Subscribe to an event once */
  once: <TPayload = unknown>(
    event: string,
    handler: EventHandler<TPayload>
  ) => () => void;
  /** Unsubscribe from an event */
  off: <TPayload = unknown>(
    event: string,
    handler?: EventHandler<TPayload>
  ) => void;
  /** Emit an event */
  emit: <TPayload = unknown>(
    event: string,
    payload?: TPayload,
    options?: { forwardToMain?: boolean }
  ) => Promise<void>;
  /** Create a scoped event bus */
  createScope: (componentName: string) => void;
  /** Get event statistics */
  getStats: () => import('../../shared/events/types').EventBusStats;
}

/**
 * Use Event Bus in Vue components
 *
 * @example
 * ```typescript
 * // Basic usage
 * const { on, emit } = useEventBus();
 *
 * on('user:login', (data) => {
 *   console.log('User logged in:', data);
 * });
 *
 * emit('user:login', { userId: '123' });
 *
 * // With auto-subscription
 * const { on, off } = useEventBus({ autoSubscribe: true });
 *
 * onMounted(() => {
 *   on('data:loaded', handleData);
 * });
 *
 * onUnmounted(() => {
 *   off('data:loaded', handleData);
 * });
 *
 * // With scoped events
 * const { emit } = useEventBus({ scope: 'MyComponent' });
 * emit('ready'); // Emits 'MyComponent:ready'
 * ```
 */
export function useEventBus(
  options: UseEventBusOptions = {}
): UseEventBusReturn {
  const { autoSubscribe = true, scope, defaultOptions = {} } = options;

  const eventBus = getRendererEventBus({
    name: scope ?? 'renderer',
    debug: false,
  });

  const subscriptions = new Set<() => void>();

  // Auto-cleanup for scoped events
  const instance = getCurrentInstance();
  if (instance && autoSubscribe) {
    onUnmounted(() => {
      subscriptions.forEach(unsubscribe => unsubscribe());
      subscriptions.clear();
    });
  }

  /**
   * Subscribe to an event with auto-cleanup
   */
  function on<TPayload = unknown>(
    event: string,
    handler: EventHandler<TPayload>,
    opts?: SubscriptionOptions
  ): () => void {
    const finalOptions = { ...defaultOptions, ...opts };
    const unsubscribe = eventBus.on(event, handler, finalOptions);

    if (autoSubscribe && instance) {
      subscriptions.add(unsubscribe);
    }

    return unsubscribe;
  }

  /**
   * Subscribe to an event once
   */
  function once<TPayload = unknown>(
    event: string,
    handler: EventHandler<TPayload>
  ): () => void {
    return on(event, handler, { once: true });
  }

  /**
   * Unsubscribe from an event
   */
  function off<TPayload = unknown>(
    event: string,
    handler?: EventHandler<TPayload>
  ): void {
    eventBus.off(event, handler);
  }

  /**
   * Emit an event
   */
  async function emit<TPayload = unknown>(
    event: string,
    payload?: TPayload,
    emitOptions?: { forwardToMain?: boolean }
  ): Promise<void> {
    const finalEvent = scope ? `${scope}:${event}` : event;
    return eventBus.emit(finalEvent, payload, emitOptions);
  }

  /**
   * Create a scoped event bus
   */
  function createScope(componentName: string): void {
    // This could create a new scoped instance if needed
    console.log('Creating scope:', componentName);
  }

  /**
   * Get event statistics
   */
  function getStats(): import('../../shared/events/types').EventBusStats {
    return eventBus.getStats();
  }

  return {
    eventBus,
    on,
    once,
    off,
    emit,
    createScope,
    getStats,
  };
}

/**
 * Typed event subscription helper
 *
 * @example
 * ```typescript
 * const { onTyped } = useTypedEventBus();
 *
 * onTyped('user:login', (data) => {
 *   // data is typed as { userId: string; username: string }
 *   console.log(data.userId);
 * });
 * ```
 */
export function useTypedEventBus() {
  const base = useEventBus();

  return {
    ...base,
    /**
     * Subscribe to a typed event
     */
    onTyped: <TEvent extends import('../../shared/events').EventName>(
      event: TEvent,
      handler: EventHandler<import('../../shared/events').EventPayload<TEvent>>,
      options?: SubscriptionOptions
    ) => base.on(event, handler as EventHandler, options),
  };
}
