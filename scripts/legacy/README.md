# Legacy Scripts

This directory contains deprecated/legacy scripts that are no longer used but kept for reference.

## Files

- `build-electron.mjs` - Old Electron build script
- `build-frontend.mjs` - Old frontend build script
- `build.mjs` - Old combined build script
- `check-dependencies.mjs` - Old dependency checker
- `dev-electron.mjs` - Old Electron dev launcher
- `fix-imports.js` - Old import fixer utility
- `main.mjs` - Old main entry point
- `start.mjs` - Old start script

## Current Scripts

The active scripts are now in:
- `cli.mjs` - Main CLI entry point
- `commands/` - Command implementations
- `core/` - Core utilities
- `utils/` - Helper utilities

## Migration

If you need functionality from these legacy scripts, refer to the new implementations in `commands/`.
