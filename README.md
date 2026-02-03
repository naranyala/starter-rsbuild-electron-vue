# Electron + Vue + Rsbuild Starter

A production-minded Electron starter that combines Vue 3, Rsbuild, and a clean CLI workflow. It is designed for fast iteration in development and predictable packaging in production, with a security-first preload boundary and a modular main-process architecture.

## Why This Starter
- Vue 3 + Pinia for a modern, composable UI layer.
- Rsbuild for fast dev server startup and efficient production bundling.
- A single CLI entry point for dev, build, and packaging tasks.
- A preload API that cleanly separates renderer and main process responsibilities.
- Electron Builder configuration included for cross-platform distribution.
- Biome for consistent formatting and linting.

## Architecture At A Glance
- Main process: `src/main.ts` for production and `src/main-dev.ts` for development.
- Preload: `src/preload.ts` exposes a typed API to the renderer.
- Renderer: `src/renderer/main.ts` bootstraps the Vue app.
- Build pipeline: `scripts/cli.mjs` orchestrates builds and packaging.

## Quickstart
```bash
bun install
bun run dev
```

If you prefer Node.js:
```bash
npm install
npm run dev
```

## Commands
| Command | Description |
| --- | --- |
| `bun run dev` | Start Electron dev mode (renderer + main) |
| `bun run dev:web` | Start renderer dev server only |
| `bun run build` | Compile TypeScript and build renderer |
| `bun run build:frontend` | Build renderer only |
| `bun run build:ts` | Compile TypeScript to `dist-ts/` |
| `bun run dist` | Package installers with electron-builder |
| `bun run start` | Start the built Electron app |
| `bun run lint` | Biome lint check |
| `bun run format` | Biome format |

## Documentation
- `docs/README.md`
- `docs/ai-agents.md`
- `docs/architecture.md`
- `docs/development.md`
- `docs/ipc.md`
- `docs/build-packaging.md`

## Project Structure
```
.
├── build/                  # Renderer build output (Rsbuild)
├── dist/                   # Packaged Electron artifacts
├── dist-ts/                # Compiled TypeScript output
├── scripts/                # CLI and build orchestration
├── src/
│   ├── main.ts             # Production Electron main process
│   ├── main-dev.ts         # Development Electron main process
│   ├── preload.ts          # Preload API surface
│   ├── renderer/           # Vue application
│   ├── main/               # Main-process services and handlers
│   └── shared/             # Shared types and utilities
├── rsbuild.config.ts       # Rsbuild config
└── package.json            # Scripts and electron-builder config
```

## IPC And Preload Notes
- The preload API is defined in `src/preload.ts` and exposed as `window.electronAPI`.
- `src/main-dev.ts` wires the full preload API in development.
- `src/main.ts` currently wires app/system handlers and example use-case handlers for production. If you need additional IPC in production, add handlers there.

## Configuration
- `rsbuild.config.ts` controls renderer bundling.
- Optional `build.config.js` or `build.config.mjs` can override CLI defaults. See `scripts/core/config.mjs`.

## Packaging
Packaging is handled by electron-builder using the `build` config in `package.json`. Run:
```bash
bun run dist
```

## License
MIT
