/**
 * Event Bus Usage Examples
 * Demonstrates various event bus patterns and use cases
 */

import type { EventData, EventMiddleware } from '../../shared/events';
import { getMainEventBus } from '../events/main-event-bus';

/**
 * Example 1: Basic Event Subscription
 */
export function exampleBasicUsage(): void {
  const eventBus = getMainEventBus();

  // Subscribe to an event
  const unsubscribe = eventBus.on('user:login', data => {
    console.log('User logged in:', data);
  });

  // Emit an event
  void eventBus.emit('user:login', { userId: '123', username: 'john' });

  // Unsubscribe
  unsubscribe();
}

/**
 * Example 2: Wildcard Patterns
 */
export function exampleWildcardPatterns(): void {
  const eventBus = getMainEventBus();

  // Listen to all user events
  eventBus.on('user:*', (data, event) => {
    console.log(`User event: ${event.name}`, data);
  });

  // Listen to all created events
  eventBus.on('*.created', (data, event) => {
    console.log(`Something created: ${event.name}`, data);
  });

  // Listen to everything
  eventBus.on('*', (data, event) => {
    console.log(`Any event: ${event.name}`, data);
  });

  // These will all trigger the wildcards
  void eventBus.emit('user:login', { userId: '1' });
  void eventBus.emit('user:created', { userId: '2' });
  void eventBus.emit('file:created', { path: '/test' });
}

/**
 * Example 3: Middleware
 */
export function exampleMiddleware(): void {
  const eventBus = getMainEventBus();

  // Logging middleware
  const loggingMiddleware: EventMiddleware = async (event, next) => {
    console.log(`[Middleware] Event starting: ${event.name}`);
    const start = performance.now();

    await next();

    const duration = performance.now() - start;
    console.log(
      `[Middleware] Event completed: ${event.name} (${duration.toFixed(2)}ms)`
    );
  };

  // Validation middleware
  const validationMiddleware: EventMiddleware = async (event, next) => {
    if (!event.name.includes(':')) {
      console.warn(`[Middleware] Invalid event name: ${event.name}`);
      return;
    }
    await next();
  };

  // Error handling middleware
  const errorMiddleware: EventMiddleware = async (event, next) => {
    try {
      await next();
    } catch (error) {
      console.error(`[Middleware] Error in ${event.name}:`, error);
      // Emit error event
      void eventBus.emit('error:handled', {
        error: error instanceof Error ? error.message : 'Unknown error',
        originalEvent: event.name,
      });
    }
  };

  // Register middleware
  eventBus.use(loggingMiddleware);
  eventBus.use(validationMiddleware);
  eventBus.use(errorMiddleware);
}

/**
 * Example 4: Debounce and Throttle
 */
export function exampleRateLimiting(): void {
  const eventBus = getMainEventBus();

  // Debounced handler (waits for pause in events)
  eventBus.on(
    'window:resize',
    data => {
      console.log('Window resized (debounced):', data);
    },
    { debounce: 300 }
  );

  // Throttled handler (max once per interval)
  eventBus.on(
    'file:changed',
    data => {
      console.log('File changed (throttled):', data);
    },
    { throttle: 1000 }
  );

  // These will be rate-limited
  for (let i = 0; i < 10; i++) {
    void eventBus.emit('window:resize', { width: 800 + i, height: 600 });
  }
}

/**
 * Example 5: Priority-based Execution
 */
export function examplePriority(): void {
  const eventBus = getMainEventBus();

  // High priority handler runs first
  eventBus.on(
    'app:start',
    () => {
      console.log('1. High priority handler');
    },
    { priority: 10 }
  );

  // Medium priority
  eventBus.on(
    'app:start',
    () => {
      console.log('2. Medium priority handler');
    },
    { priority: 5 }
  );

  // Low priority runs last
  eventBus.on(
    'app:start',
    () => {
      console.log('3. Low priority handler');
    },
    { priority: 1 }
  );

  void eventBus.emit('app:start');
  // Output order: 1, 2, 3
}

/**
 * Example 6: Once Subscription
 */
export function exampleOnce(): void {
  const eventBus = getMainEventBus();

  // Handler only runs once
  eventBus.once('app:ready', data => {
    console.log('App is ready (only logged once):', data);
  });

  // Only the first emit triggers the handler
  void eventBus.emit('app:ready', { version: '1.0.0' });
  void eventBus.emit('app:ready', { version: '1.0.0' }); // Ignored
}

/**
 * Example 7: Event Statistics
 */
export function exampleStatistics(): void {
  const eventBus = getMainEventBus();

  // Emit some events
  void eventBus.emit('user:login', { userId: '1' });
  void eventBus.emit('user:logout', { userId: '1' });
  void eventBus.emit('file:read', { path: '/test' });

  // Get statistics
  const stats = eventBus.getStats();
  console.log('Event Statistics:', stats);
  // {
  //   totalEmitted: 3,
  //   totalListeners: 5,
  //   eventsByName: { 'user:login': 1, 'user:logout': 1, 'file:read': 1 },
  //   avgHandlerTime: 0.5
  // }

  // Get event history
  const history = eventBus.getHistory(5);
  console.log('Recent events:', history);
}

/**
 * Example 8: Cross-process Events (Main to Renderer)
 */
export function exampleCrossProcess(): void {
  const eventBus = getMainEventBus({ forwardToRenderer: true });

  // This event will be forwarded to all renderer windows
  void eventBus.emit(
    'ui:notification:show',
    {
      title: 'Hello',
      message: 'From main process!',
      type: 'info' as const,
    },
    { forwardToRenderer: true }
  );
}

/**
 * Example 9: Error Handling
 */
export function exampleErrorHandling(): void {
  const eventBus = getMainEventBus();

  // Handler that might throw
  eventBus.on('risky:operation', () => {
    throw new Error('Something went wrong!');
  });

  // Error handler
  eventBus.on('error:handled', data => {
    console.error('Handled error:', data);
  });

  // This will trigger error:handled
  void eventBus.emit('risky:operation');
}

/**
 * Example 10: Component-scoped Events (Renderer)
 */
export function exampleComponentScope(): void {
  const eventBus = getMainEventBus();

  // Create a scope for a component
  const componentPrefix = 'MyComponent:';

  // Component-specific events
  eventBus.on(`${componentPrefix}mounted`, () => {
    console.log('Component mounted');
  });

  eventBus.on(`${componentPrefix}data-loaded`, data => {
    console.log('Component data loaded:', data);
  });

  // Emit scoped events
  void eventBus.emit(`${componentPrefix}mounted`);
  void eventBus.emit(`${componentPrefix}data-loaded`, { count: 10 });
}

/**
 * Example 11: Event Data Access
 */
export function exampleEventData(): void {
  const eventBus = getMainEventBus();

  eventBus.on('user:action', (data, event: EventData) => {
    console.log('Payload:', data);
    console.log('Event name:', event.name);
    console.log('Event ID:', event.eventId);
    console.log('Timestamp:', event.timestamp);
    console.log('Source:', event.source);
  });

  void eventBus.emit('user:action', { action: 'click' });
}

/**
 * Example 12: Conditional Event Handling
 */
export function exampleConditionalHandling(): void {
  const eventBus = getMainEventBus();

  // Middleware that conditionally blocks events
  const authMiddleware: EventMiddleware = async (event, next) => {
    const requiresAuth = event.name.startsWith('admin:');

    if (requiresAuth) {
      const isAuthenticated = true; // Check your auth state
      if (!isAuthenticated) {
        console.warn(`[Auth] Blocked unauthorized event: ${event.name}`);
        return;
      }
    }

    await next();
  };

  eventBus.use(authMiddleware);
}
