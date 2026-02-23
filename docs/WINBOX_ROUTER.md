# WinBox Router Documentation

## Overview

This application uses **WinBox.js as a router-like solution** instead of traditional URL-based routing. Each "route" is a floating, draggable window that can be moved, resized, minimized, maximized, and stacked.

## Why WinBox Router?

- 🪟 **Window-based navigation** - Each view is a floating window
- 📚 **No URL routing** - Pure JavaScript navigation
- 🖱️ **Multi-window support** - Open multiple views simultaneously
- 🎨 **Native desktop feel** - Like a real desktop application
- 📦 **Zero config** - No webpack/vite routing setup needed

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    WinBox Router                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   View 1    │  │   View 2    │  │   View 3    │      │
│  │  (Floating) │  │  (Floating) │  │  (Floating) │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              View Registry                        │   │
│  │  - electron-intro                                 │   │
│  │  - electron-architecture                          │   │
│  │  - electron-security                              │   │
│  │  - ...                                            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Navigation History                   │   │
│  │  - Back/Forward support                           │   │
│  │  - Window stack management                        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Basic Usage in Vue Component

```vue
<template>
  <div>
    <button @click="openIntro">Open Intro</button>
    <button @click="openSecurity">Open Security</button>
    <button @click="closeAll">Close All</button>
    
    <div>Current View: {{ currentView }}</div>
    <div>Windows: {{ windowCount }}</div>
  </div>
</template>

<script setup lang="ts">
import { useWinBoxNavigation } from '@/renderer/composables';

const { navigate, close, closeAll, currentView, windowCount } = useWinBoxNavigation();

const openIntro = async () => {
  await navigate('electron-intro');
};

const openSecurity = async () => {
  await navigate('electron-security', { section: 'overview' });
};
</script>
```

---

## API Reference

### useWinBoxNavigation()

Main composable for WinBox navigation.

```typescript
import { useWinBoxNavigation } from '@/renderer/composables';

const {
  // Navigation
  navigate,      // (viewName, params?, options?) => Promise<boolean>
  close,         // () => Promise<void>
  closeAll,      // () => Promise<void>
  back,          // () => Promise<boolean>
  forward,       // () => Promise<boolean>
  
  // State
  currentView,   // Ref<string | null>
  windowCount,   // Ref<number>
  activeWindows, // Ref<Map<string, ActiveWindow>>
  canGoBack,     // ComputedRef<boolean>
  canGoForward,  // ComputedRef<boolean>
  
  // Window management
  focusWindow,   // (windowId) => boolean
  minimizeWindow,// (windowId) => boolean
} = useWinBoxNavigation();
```

### navigate(viewName, params?, options?)

Navigate to a view (opens a new window).

```typescript
// Basic navigation
await navigate('electron-intro');

// With parameters
await navigate('electron-security', { 
  section: 'ipc',
  topic: 'security-best-practices'
});

// With custom window options
await navigate('electron-architecture', null, {
  width: 800,
  height: 600,
  x: 100,
  y: 50,
  background: '#1a1a2e',
});
```

### Window Options

```typescript
interface WindowOptions {
  width?: string | number;   // Window width
  height?: string | number;  // Window height
  x?: string | number;       // X position
  y?: string | number;       // Y position
  min?: boolean;             // Start minimized
  max?: boolean;             // Start maximized
  background?: string;       // Window background color
  class?: string[];          // CSS classes
}
```

---

## Registering Views

### In Router Configuration

```typescript
// src/renderer/router/views.ts
import { getRouter, type ViewConfig } from '../router';
import MyView from './MyView.vue';

export const views: ViewConfig[] = [
  {
    name: 'my-view',
    title: 'My View',
    component: MyView,
    windowOptions: {
      width: 600,
      height: 400,
      background: '#1a1a2e',
    },
    beforeEnter: (params) => {
      // Guard - return false to block navigation
      return true;
    },
    onEnter: (params) => {
      // Called when view opens
      console.log('View opened', params);
    },
    onLeave: () => {
      // Called when view closes
      console.log('View closed');
    },
  },
];

// Initialize
export function initializeRouter() {
  const router = getRouter();
  router.registerViews(views);
}
```

---

## Navigation Guards

### beforeEnter

Block navigation based on conditions.

```typescript
const views: ViewConfig[] = [
  {
    name: 'admin-settings',
    title: 'Admin Settings',
    component: AdminSettings,
    beforeEnter: async (params) => {
      const { useAuthStore } = await import('@/stores/auth');
      const auth = useAuthStore();
      
      if (!auth.isAdmin) {
        alert('Admin access required');
        return false;
      }
      return true;
    },
  },
];
```

### onEnter / onLeave

Lifecycle hooks for views.

```typescript
{
  name: 'data-viewer',
  title: 'Data Viewer',
  component: DataViewer,
  onEnter: (params) => {
    // Load data when view opens
    loadData(params?.id);
  },
  onLeave: () => {
    // Cleanup when view closes
    cleanup();
  },
}
```

---

## History Navigation

```vue
<template>
  <div>
    <button @click="back" :disabled="!canGoBack">← Back</button>
    <button @click="forward" :disabled="!canGoForward">Forward →</button>
  </div>
</template>

<script setup lang="ts">
import { useWinBoxNavigation } from '@/renderer/composables';

const { back, forward, canGoBack, canGoForward } = useWinBoxNavigation();
</script>
```

---

## Window Management

### Close Specific Window

```typescript
const { activeWindows, close } = useWinBoxNavigation();

// Close a specific window by ID
const windows = activeWindows.value;
for (const [id, window] of windows.entries()) {
  if (window.viewName === 'electron-intro') {
    await router.close(id);
  }
}
```

### Minimize All Windows

```typescript
const { activeWindows, minimizeWindow } = useWinBoxNavigation();

const windows = activeWindows.value;
for (const [id] of windows.entries()) {
  minimizeWindow(id);
}
```

### Focus Window

```typescript
const { activeWindows, focusWindow } = useWinBoxNavigation();

const windows = activeWindows.value;
const firstWindow = windows.entries().next().value;
if (firstWindow) {
  focusWindow(firstWindow[0]);
}
```

---

## Advanced Usage

### Dynamic View Registration

```typescript
import { addView } from '@/renderer/router/views';

// Add view at runtime
addView({
  name: 'dynamic-report',
  title: 'Dynamic Report',
  component: ReportViewer,
  windowOptions: {
    width: 900,
    height: 700,
  },
});
```

### Custom Window Factory

```typescript
import { WindowFactory } from '@/renderer/services/window-factory';

// Create custom window
const customWindow = WindowFactory.createWindow(
  'Custom Title',
  '<div>Custom HTML content</div>',
  {
    width: 500,
    height: 400,
    background: '#16213e',
  }
);
```

### Integration with Event Bus

```typescript
import { useWinBoxNavigation } from '@/renderer/composables';
import { useEventBus } from '@/renderer/composables';

const { navigate } = useWinBoxNavigation();
const { emit } = useEventBus();

// Emit event when navigating
const openView = async () => {
  await navigate('data-viewer', { id: 123 });
  emit('view:opened', { view: 'data-viewer' });
};
```

---

## Registered Views

### Built-in Views

| View Name | Component | Description |
|-----------|-----------|-------------|
| `electron-intro` | ElectronIntro.vue | Introduction to Electron |
| `electron-architecture` | ElectronArchitecture.vue | Architecture overview |
| `electron-security` | ElectronSecurity.vue | Security best practices |
| `electron-packaging` | ElectronPackaging.vue | Packaging and distribution |
| `electron-native-apis` | ElectronNativeAPIs.vue | Native API usage |
| `electron-performance` | ElectronPerformance.vue | Performance optimization |
| `electron-development` | ElectronDevelopment.vue | Development workflow |
| `electron-versions` | ElectronVersions.vue | Version information |

---

## Best Practices

### 1. Use Named Views

```typescript
// ✅ Good
await navigate('electron-intro');

// ❌ Avoid hardcoding window creation
new WinBox({ title: 'Intro' });
```

### 2. Handle Cleanup in onLeave

```typescript
{
  name: 'data-viewer',
  onLeave: () => {
    // Clear subscriptions, timers, etc.
    cleanup();
  },
}
```

### 3. Use Guards for Access Control

```typescript
{
  name: 'admin-panel',
  beforeEnter: () => isAuthenticated,
}
```

### 4. Limit Open Windows

```typescript
const router = getRouter({
  maxWindows: 10,  // Auto-close oldest when limit reached
});
```

### 5. Stack Related Windows

```typescript
const router = getRouter({
  stackWindows: true,  // New windows appear on top
});
```

---

## Troubleshooting

### Window Not Opening

1. Check if view is registered: `router.hasView('view-name')`
2. Check console for errors
3. Verify WinBox is imported: `import 'winbox'`

### Navigation Not Working

1. Ensure router is initialized in main.ts
2. Check beforeEnter guards aren't blocking
3. Verify component is properly exported

### Window Position Issues

```typescript
// Use explicit positioning
await navigate('my-view', null, {
  x: 'center',
  y: 'center',
  width: 600,
  height: 400,
});
```

---

## Migration from Vue Router

If migrating from Vue Router:

```typescript
// Vue Router
router.push({ name: 'user', params: { id: 123 } });

// WinBox Router
await navigate('user', { id: 123 });

// Vue Router
router.back();

// WinBox Router
await back();
```

---

## Examples

See these components for usage examples:

- `src/renderer/components/App.vue` - Main app navigation
- `src/renderer/views/HomeView.vue` - Home view with navigation
- `src/renderer/router/views.ts` - View registry
