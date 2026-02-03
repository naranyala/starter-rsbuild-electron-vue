# Build And Packaging

## Renderer Build (Rsbuild)
- Config: `rsbuild.config.ts`
- Entry: `src/renderer/main.ts`
- Output: `build/`
- Static assets: `src/renderer/assets` -> `build/assets/`

## TypeScript Compilation
- Command: `bun run build:ts`
- Output: `dist-ts/`
- Main entry compiled to `dist-ts/src/main.js`

## Full Build
- Command: `bun run build`
- Step: Compile TypeScript.
- Step: Build renderer via Rsbuild.
- Step: Copy preload output into `dist-ts/` when available.

## Packaging
- Command: `bun run dist`
- Packaging uses `electron-builder` and the `build` config in `package.json`.
- Output: `dist/`

## Electron-Builder Notes
- App metadata is declared in `package.json`.
- Platform targets are configured for macOS, Windows, and Linux.
