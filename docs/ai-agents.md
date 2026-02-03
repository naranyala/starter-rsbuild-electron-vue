# AI Agent Guide

This repository is an Electron + Vue 3 starter built around Rsbuild and a small Node-based CLI. This doc is optimized for automation and safe edits.

## Fast Facts
- Entry points: `src/main.ts` (prod main), `src/main-dev.ts` (dev main), `src/preload.ts` (preload), `src/renderer/main.ts` (renderer).
- Build outputs: `build/` (renderer), `dist-ts/` (compiled TypeScript), `dist/` (packaged app).
- Task runner: `scripts/cli.mjs` (all commands go through it).
- Lint/format: Biome via `bun run lint` and `bun run format`.

## Where To Start
- Read `docs/architecture.md` for process boundaries and file layout.
- Read `docs/ipc.md` for the preload API surface and IPC conventions.
- Read `docs/development.md` for command and workflow details.

## Typical Workflows
- Run dev app: `bun run dev`.
- Run web-only renderer: `bun run dev:web`.
- Production build: `bun run build`.
- Package installers: `bun run dist`.

## Conventions To Preserve
- The main process uses explicit security settings. Do not relax them without a reason.
- IPC handlers return `{ success, data | error }` from `src/main/lib/ipc-utils.ts`.
- Renderer code is Vue 3 + Pinia. Keep store logic in `src/renderer/stores`.
- Assets are bundled by Rsbuild from `src/renderer/assets` into `build/assets`.

## Safe Areas For Refactors
- Renderer components and views in `src/renderer/components` and `src/renderer/views`.
- Main-process services in `src/main/services`.
- Use-case handlers in `src/main/handlers` (mostly static content right now).

## Risky Areas
- `src/main.ts` and `src/main-dev.ts`: changing window or security configuration can break app boot.
- `src/preload.ts`: API changes here must match renderer usage.
- `scripts/`: build and dev orchestration are centralized here.

## Suggested Checks
- Lint: `bun run lint`.
- Format: `bun run format`.
- There are no automated tests in this repository right now.

## When Updating Docs
- Keep everything consistent with `package.json` and `rsbuild.config.ts`.
- Call out any breaking changes explicitly in `README.md`.
