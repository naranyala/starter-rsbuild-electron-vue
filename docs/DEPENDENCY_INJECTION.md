# Dependency Injection Structure

This project uses a lightweight, type-safe Dependency Injection (DI) system inspired by Angular's DI framework, adapted for Electron + Vue applications.

**No decorators required!** The DI system works with plain TypeScript classes and Vue 3's Composition API.

## Architecture Overview

```
src/
├── shared/
│   └── di/                    # Core DI abstractions
│       ├── di-container.ts    # DIContainer class
│       ├── injection-token.ts # Type-safe tokens
│       ├── injectable.ts      # @Injectable decorator
│       └── service-metadata.ts# Service lifetime & metadata
│
├── backend/
│   └── di/                    # Backend DI setup
│       ├── tokens.ts          # Backend injection tokens
│       ├── service-providers.ts
│       ├── backend-container.ts
│       └── index.ts
│   └── use-cases/             # Backend services
│       ├── window-service-instance.ts
│       ├── file-service-instance.ts
│       └── app-service-instance.ts
│
└── frontend/
    └── di/                    # Frontend DI setup
        ├── tokens.ts          # Frontend injection tokens
        ├── service-providers.ts
        ├── frontend-container.ts
        └── index.ts
    ├── services/              # Frontend services
    │   ├── ipc-service.ts
    │   └── window-service.ts
    └── composables/           # Vue composables for DI
        ├── useInject.ts
        ├── useIPC.ts
        ├── useWindow.ts
        └── useAppInfo.ts
```

## Core Concepts

### 1. Injection Tokens

Type-safe identifiers for dependencies:

```typescript
import { InjectionToken } from '@/shared/di';

export const MY_SERVICE_TOKEN = new InjectionToken<MyService>(
  'MyService',
  'Description of the service'
);
```

### 2. Plain TypeScript Classes (No Decorators!)

Services are simple classes - no decorators needed:

```typescript
// src/services/my-service.ts
export class MyService {
  constructor(private dependency: SomeType) {}
  
  doSomething(): string {
    return this.dependency.getValue();
  }
}
```

If you want automatic constructor injection, you can optionally use decorators:

```typescript
import { Injectable, Inject } from '@/shared/di';
import { SOME_TOKEN } from './tokens';

@Injectable([SOME_TOKEN])
export class MyService {
  constructor(@Inject(SOME_TOKEN) private dependency: SomeType) {}
}
```

### 3. DI Container

Register and resolve dependencies:

```typescript
import { DIContainer, ServiceLifetime } from '@/shared/di';

const container = new DIContainer();

// Register services
container.addSingleton(MY_SERVICE_TOKEN, MyService);
container.addTransient(OTHER_TOKEN, OtherService);
container.addFactory(FACTORY_TOKEN, () => new SomeClass());
container.addValue(CONFIG_TOKEN, { api: 'key' });

// Resolve services
const service = container.get(MY_SERVICE_TOKEN);
```

### 4. Service Lifetimes

- **Singleton**: One instance per container (default)
- **Transient**: New instance every time
- **Scoped**: One instance per scope (child container)

## Backend Usage

### Registering Services

```typescript
// src/backend/di/service-providers.ts
import type { DIContainer } from '@/shared/di';
import { ServiceLifetime } from '@/shared/di';

export function registerAppServices(container: DIContainer): void {
  container.addSingleton(WINDOW_SERVICE_TOKEN, WindowServiceInstance);
  container.addSingleton(FILE_SERVICE_TOKEN, FileServiceInstance);
  container.addSingleton(APP_SERVICE_TOKEN, AppServiceInstance);
}
```

### Using Services

```typescript
// src/backend/backend.ts
import { getBackendContainer } from './di';
import { WINDOW_SERVICE_TOKEN, APP_SERVICE_TOKEN } from './use-cases';

const container = getBackendContainer();

function createMainWindow() {
  const windowService = container.get(WINDOW_SERVICE_TOKEN);
  const mainWindow = windowService.create({ name: 'main' });
  return mainWindow;
}

function registerIpcHandlers() {
  const appService = container.get(APP_SERVICE_TOKEN);
  appService.registerHandlers();
}
```

### Creating Injectable Services

**Recommended: Plain classes with factory registration**

```typescript
// src/backend/use-cases/my-service.ts
export class MyServiceInstance {
  constructor(private ipcMain: Electron.IpcMain) {}

  doSomething(): void {
    this.ipcMain.handle('my:channel', () => 'result');
  }
}

// Registration (in service-providers.ts)
container.addFactory(APP_SERVICE_TOKEN, () => {
  const ipcMain = container.get(ELECTRON_IPC_MAIN_TOKEN);
  return new MyServiceInstance(ipcMain);
});
```

**Optional: Using decorators for automatic injection**

```typescript
// src/backend/use-cases/my-service.ts
import { Injectable, Inject } from '@/shared/di';
import { ELECTRON_IPC_MAIN_TOKEN } from '../di/tokens';

@Injectable([ELECTRON_IPC_MAIN_TOKEN])
export class MyServiceInstance {
  constructor(@Inject(ELECTRON_IPC_MAIN_TOKEN) private ipcMain: Electron.IpcMain) {}

  doSomething(): void {
    this.ipcMain.handle('my:channel', () => 'result');
  }
}
```

## Frontend Usage

### Vue Integration

The DI container is automatically provided to all Vue components:

```typescript
// src/frontend/main.ts
import { getFrontendContainer } from './di';

const container = getFrontendContainer({
  version: '0.1.0',
  name: 'My App',
});

const app = createApp(App);
app.provide('DIContainer', container);
```

### Using Composables

```vue
<script setup lang="ts">
import { useIPC, useWindow, useAppInfo } from '@/frontend/composables';

// IPC communication
const { invoke, send, on } = useIPC();

// Window management
const { minimize, maximize, close } = useWindow();

// App info
const { version, name, isDevelopment } = useAppInfo();

// Usage
const handleMinimize = async () => {
  await minimize();
};

const getAppVersion = async () => {
  const version = await invoke<string>('app:getVersion');
};
</script>
```

### Custom Injection

```typescript
import { useInject } from '@/frontend/composables';
import { MY_SERVICE_TOKEN } from '@/frontend/di';

// In a composable or setup function
const myService = useInject(MY_SERVICE_TOKEN);
```

### Creating Frontend Services

**Recommended: Plain classes with factory registration**

```typescript
// src/frontend/services/my-service.ts
import type { IPCService } from '../di/tokens';

export class MyServiceInstance {
  constructor(private ipc: IPCService) {}

  async fetchData(): Promise<unknown> {
    return this.ipc.invoke('fetch:data');
  }
}

// Registration (in service-providers.ts)
container.addFactory(MY_SERVICE_TOKEN, () => {
  const ipc = container.get(IPC_SERVICE_TOKEN);
  return new MyServiceInstance(ipc);
});
```

## Testing

### Mocking Dependencies

```typescript
import { DIContainer } from '@/shared/di';
import { MY_SERVICE_TOKEN } from './tokens';

// Create test container
const testContainer = new DIContainer();

// Register mocks
testContainer.addValue(MY_SERVICE_TOKEN, {
  doSomething: () => 'mocked',
});

// Use in tests
const service = testContainer.get(MY_SERVICE_TOKEN);
```

### Resetting Containers

```typescript
import { resetBackendContainer, resetFrontendContainer } from '@/backend/di';

// In test teardown
afterEach(() => {
  resetBackendContainer();
  resetFrontendContainer();
});
```

## Best Practices

1. **Use tokens for all dependencies** - Never import services directly
2. **Keep services focused** - Single responsibility principle
3. **Use appropriate lifetimes** - Singleton for stateless, Transient for stateful
4. **Inject interfaces, not implementations** - Use tokens for abstraction
5. **Use composables in Vue** - Don't access container directly in components

## Migration Guide

### From Static Classes to DI

**Before:**
```typescript
// Static class
export class FileService {
  static read(path: string): string {
    return fs.readFileSync(path, 'utf-8');
  }
}

// Usage
const content = FileService.read('file.txt');
```

**After:**
```typescript
// Injectable service
@Injectable()
export class FileServiceInstance {
  read(path: string): string {
    return fs.readFileSync(path, 'utf-8');
  }
}

// Usage via container
const container = getBackendContainer();
const fileService = container.get(FILE_SERVICE_TOKEN);
const content = fileService.read('file.txt');
```

## API Reference

### DIContainer

| Method | Description |
|--------|-------------|
| `register(token, options)` | Register a service with full options |
| `addSingleton(token, class?)` | Register as singleton |
| `addTransient(token, class?)` | Register as transient |
| `addFactory(token, factory)` | Register with factory function |
| `addValue(token, value)` | Register a constant value |
| `get(token)` | Resolve a dependency |
| `createScope()` | Create child container |
| `isRegistered(token)` | Check if token exists |
| `clearInstances()` | Clear cached instances |
| `dispose()` | Dispose container |

### Decorators

| Decorator | Description |
|-----------|-------------|
| `@Injectable(deps?)` | Mark class as injectable |
| `@Inject(token)` | Inject specific token |

### ServiceLifetime

| Value | Description |
|-------|-------------|
| `Singleton` | One instance per container |
| `Transient` | New instance each time |
| `Scoped` | One instance per scope |
