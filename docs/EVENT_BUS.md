# Event Bus System Documentation

## Overview

The Event Bus system provides a type-safe, feature-rich publish-subscribe pattern for communication within and between Electron processes (main and renderer).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Event Bus System                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐              │
│  │  Main Process    │         │ Renderer Process │              │
│  │                  │         │                  │              │
│  │  MainEventBus    │◄───────►│ RendererEventBus │              │
│  │                  │   IPC   │                  │              │
│  │  - Window events │         │ - UI events      │              │
│  │  - File events   │         │ - Component evts │              │
│  │  - App lifecycle │         │ - User actions   │              │
│  └──────────────────┘         └──────────────────┘              │
│           ▲                              ▲                       │
│           │                              │                       │
│           └──────────┬───────────────────┘                       │
│                      │                                           │
│              ┌───────▼────────┐                                  │
│              │ Shared EventBus│                                  │
│              │   (Core)       │                                  │
│              └────────────────┘                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Features

- ✅ **Type-safe** event definitions with TypeScript
- ✅ **Wildcard patterns** (`user:*`, `*.created`, `*`)
- ✅ **Middleware support** for logging, validation, auth
- ✅ **Rate limiting** with debounce and throttle
- ✅ **Priority-based** handler execution
- ✅ **Event history** and statistics
- ✅ **Cross-process** communication (main ↔ renderer)
- ✅ **Vue integration** via composables
- ✅ **Component scoping** for organized events

---

## Quick Start

### Main Process

```typescript
import { getMainEventBus } from '@/main/events';

const eventBus = getMainEventBus({ debug: true });

// Subscribe
eventBus.on('user:login', (data) => {
  console.log('User logged in:', data);
});

// Emit
await eventBus.emit('user:login', { userId: '123', username: 'john' });
```

### Renderer Process (Vue Component)

```typescript
import { useEventBus } from '@/renderer/composables';

export default {
  setup() {
    const { on, emit } = useEventBus();

    // Subscribe
    on('user:login', (data) => {
      console.log('User logged in:', data);
    });

    // Emit
    await emit('user:login', { userId: '123' });
  }
};
```

---

## API Reference

### Core Methods

#### `on(event, handler, options?)`

Subscribe to an event.

```typescript
// Basic subscription
const unsubscribe = eventBus.on('user:login', (data) => {
  console.log(data);
});

// With options
eventBus.on('window:resize', (data) => {
  console.log(data);
}, { 
  debounce: 300,  // Wait 300ms after last event
  priority: 10,   // Higher = runs first
});

// Unsubscribe
unsubscribe();
```

#### `once(event, handler)`

Subscribe to an event that only fires once.

```typescript
eventBus.once('app:ready', (data) => {
  console.log('App is ready!');
});
```

#### `emit(event, payload?, options?)`

Emit an event.

```typescript
// Local emit
await eventBus.emit('user:login', { userId: '123' });

// Cross-process (main to renderer)
await eventBus.emit('ui:notify', { message: 'Hello' }, { 
  forwardToRenderer: true 
});
```

#### `off(event, handler?)`

Unsubscribe from an event.

```typescript
// Remove specific handler
eventBus.off('user:login', handler);

// Remove all handlers for event
eventBus.off('user:login');

// Remove all listeners
eventBus.removeAllListeners();
```

---

### Wildcard Patterns

```typescript
// All user events
eventBus.on('user:*', (data, event) => {
  console.log(`User event: ${event.name}`);
});

// All created events
eventBus.on('*.created', (data, event) => {
  console.log(`Created: ${event.name}`);
});

// All events
eventBus.on('*', (data, event) => {
  console.log(`Any event: ${event.name}`);
});

// Triggering events
await eventBus.emit('user:login', { userId: '1' });     // Matches user:*
await eventBus.emit('user:created', { userId: '2' });   // Matches user:* and *.created
await eventBus.emit('file:created', { path: '/' });     // Matches *.created
```

---

### Middleware

```typescript
import type { EventMiddleware } from '@/shared/events';

// Logging middleware
const loggingMiddleware: EventMiddleware = async (event, next) => {
  console.log(`Event: ${event.name}`);
  const start = performance.now();
  await next();
  console.log(`Completed in ${performance.now() - start}ms`);
};

// Auth middleware
const authMiddleware: EventMiddleware = async (event, next) => {
  if (event.name.startsWith('admin:')) {
    if (!isAuthenticated) {
      console.warn('Unauthorized admin event');
      return;
    }
  }
  await next();
};

// Register middleware
eventBus.use(loggingMiddleware);
eventBus.use(authMiddleware);
```

---

### Rate Limiting

```typescript
// Debounce - wait for pause in events
eventBus.on('window:resize', (data) => {
  saveLayout(data);
}, { debounce: 300 });

// Throttle - max once per interval
eventBus.on('file:changed', (data) => {
  refreshView(data);
}, { throttle: 1000 });
```

---

### Priority

```typescript
// Higher priority runs first
eventBus.on('app:start', () => {
  console.log('1. First (priority 10)');
}, { priority: 10 });

eventBus.on('app:start', () => {
  console.log('2. Second (priority 5)');
}, { priority: 5 });

eventBus.on('app:start', () => {
  console.log('3. Third (priority 1)');
}, { priority: 1 });
```

---

## Vue Integration

### useEventBus Composable

```typescript
import { useEventBus } from '@/renderer/composables';

export default {
  setup() {
    const { on, emit, off } = useEventBus({
      autoSubscribe: true,  // Auto-cleanup on unmount
      scope: 'MyComponent', // Prefix events with component name
    });

    // Events are auto-unsubscribed on component unmount
    on('data:loaded', handleData);

    // Scoped event (emits 'MyComponent:ready')
    await emit('ready');

    return { /* ... */ };
  }
};
```

### useTypedEventBus

```typescript
import { useTypedEventBus } from '@/renderer/composables';

const { onTyped } = useTypedEventBus();

// Fully typed event handling
onTyped('user:login', (data) => {
  // data is typed as { userId: string; username: string }
  console.log(data.userId);
});
```

---

## Predefined Events

### App Events
- `app:ready` - Application started
- `app:quit` - Application quitting
- `app:focus` / `app:blur` - Window focus changes
- `app:minimize` / `app:maximize` / `app:restore` - Window state

### Window Events
- `window:created` / `window:closed` - Window lifecycle
- `window:focus` / `window:blur` - Window focus
- `window:resize` / `window:move` - Window geometry

### File Events
- `file:read` / `file:write` / `file:deleted` / `file:created`
- `file:changed` - File system changes

### UI Events
- `ui:theme:change` - Theme switching
- `ui:language:change` - Language changes
- `ui:modal:open` / `ui:modal:close` - Modal lifecycle
- `ui:notification:show` - Show notification

### Error Events
- `error:uncaught` - Uncaught errors
- `error:handled` - Handled errors
- `error:api` - API errors

---

## Cross-Process Communication

### Main to Renderer

```typescript
// Main process
const eventBus = getMainEventBus({ forwardToRenderer: true });

// This will be forwarded to all renderer windows
await eventBus.emit('ui:notification', { 
  title: 'Hello',
  message: 'From main!'
}, { forwardToRenderer: true });
```

```typescript
// Renderer process - automatically receives forwarded events
const { on } = useEventBus();

on('ui:notification', (data) => {
  showNotification(data);
});
```

### Renderer to Main

```typescript
// Renderer process
const { emit } = useEventBus();

// Forward to main process
await emit('app:quit', { reason: 'user-requested' }, { 
  forwardToMain: true 
});
```

```typescript
// Main process - receives forwarded events
const eventBus = getMainEventBus();

eventBus.on('app:quit', (data) => {
  console.log('Quit requested:', data);
});
```

---

## Statistics and Debugging

```typescript
// Get statistics
const stats = eventBus.getStats();
console.log(stats);
// {
//   totalEmitted: 100,
//   totalListeners: 15,
//   eventsByName: { 'user:login': 50, 'file:read': 50 },
//   avgHandlerTime: 2.5
// }

// Get event history
const history = eventBus.getHistory(10);
console.log('Last 10 events:', history);

// Enable debug logging
const eventBus = getMainEventBus({ debug: true });
```

---

## Best Practices

### 1. Use Typed Events

```typescript
// Define your events
interface MyEvents {
  'user:login': { userId: string; username: string };
  'user:logout': { userId: string };
}

// Use with type safety
eventBus.on('user:login', (data: MyEvents['user:login']) => {
  // Fully typed!
});
```

### 2. Clean Up Subscriptions

```typescript
// In Vue components, use autoSubscribe
const { on } = useEventBus({ autoSubscribe: true });

// Manual cleanup when needed
const unsubscribe = eventBus.on('event', handler);
onUnmounted(() => unsubscribe());
```

### 3. Use Middleware for Cross-Cutting Concerns

```typescript
// Logging
eventBus.use(loggingMiddleware);

// Auth
eventBus.use(authMiddleware);

// Error handling
eventBus.use(errorMiddleware);
```

### 4. Scope Component Events

```typescript
// Prevent event name collisions
const { emit } = useEventBus({ scope: 'UserProfile' });

emit('save'); // Emits 'UserProfile:save'
```

### 5. Use Wildcards for Categories

```typescript
// Log all user events
eventBus.on('user:*', (data, event) => {
  analytics.track(event.name, data);
});
```

---

## Migration Guide

### From EventEmitter

```typescript
// Before (Node.js EventEmitter)
emitter.on('event', handler);
emitter.emit('event', data);

// After (EventBus)
eventBus.on('event', handler);
await eventBus.emit('event', data);
```

### From Vuex/Pinia for Local State

```typescript
// Before (Pinia action)
store.dispatch('user/login', payload);

// After (EventBus for decoupled events)
await eventBus.emit('user:login', payload);
```

---

## Troubleshooting

### Events not firing

1. Check event name spelling (case-sensitive)
2. Verify subscription happens before emit
3. Check for middleware blocking the event
4. Enable debug mode: `getMainEventBus({ debug: true })`

### Memory leaks

1. Always unsubscribe when component unmounts
2. Use `autoSubscribe: true` in Vue composables
3. Call `removeAllListeners()` when appropriate

### Cross-process events not working

1. Ensure IPC is initialized in main process
2. Check that `forwardToRenderer` or `forwardToMain` is set
3. Verify electronAPI is available in renderer
