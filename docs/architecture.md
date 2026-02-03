# Architecture

This starter is split into three execution contexts: Electron main, Electron preload, and the renderer (Vue).

## Process Boundaries
- Main process: `src/main.ts` (production) and `src/main-dev.ts` (development).
- Preload: `src/preload.ts` exposes a safe API to the renderer via `contextBridge`.
- Renderer: `src/renderer/main.ts` bootstraps Vue and mounts `App.vue`.

## High-Level Flow
1. The CLI in `scripts/cli.mjs` launches development or builds production artifacts.
2. In dev, Electron loads the Rsbuild dev server URL.
3. In prod, Electron loads the built `build/index.html`.
4. The renderer calls `window.electronAPI` to invoke secure IPC handlers in the main process.

## Key Directories
- `src/main/`: main-process services, handlers, and utilities.
- `src/renderer/`: Vue app, stores, components, views, and styles.
- `src/shared/`: shared types and utilities when needed.
- `scripts/`: build and dev orchestration.
- `build/`: renderer output from Rsbuild.
- `dist-ts/`: TypeScript compilation output.
- `dist/`: packaged Electron artifacts.

## Main Process Services
- `src/main/services/window-service.ts` centralizes window creation and loading.
- `src/main/services/app-service.ts` wires IPC handlers for app-level APIs.
- `src/main/lib/ipc-utils.ts` provides IPC helper utilities with error wrapping.

## Renderer Architecture
- `src/renderer/components/` holds UI components.
- `src/renderer/views/` holds route-level or screen components.
- `src/renderer/stores/` uses Pinia for state management.
- `src/renderer/composables/` holds reusable composition functions.

## Build System
- Rsbuild is configured in `rsbuild.config.ts`.
- The build output for the renderer is `build/`.
- TypeScript compilation writes to `dist-ts/`.
