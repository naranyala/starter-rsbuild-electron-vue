# Development Workflow

## Requirements
- Bun (recommended) or Node.js 18+.
- A recent Git client.

## Install
```bash
bun install
```

## Run
```bash
bun run dev
```

## Web-Only
```bash
bun run dev:web
```

## Build
```bash
bun run build
```

## Package
```bash
bun run dist
```

## Lint And Format
```bash
bun run lint
bun run format
```

## CLI Options
All commands go through `scripts/cli.mjs`.

Supported options:
- `--mode=development|production` (default: production)
- `--port=####`
- `--no-clean`
- `--log-level=ERROR|WARN|INFO|DEBUG|TRACE`
- `--json`

Examples:
```bash
node scripts/cli.mjs dev
node scripts/cli.mjs dev:web --port=4000
node scripts/cli.mjs build --mode=development
node scripts/cli.mjs dist
```

## Local Build Config Overrides
You can add a `build.config.js` or `build.config.mjs` at the repo root to override defaults. See `scripts/core/config.mjs` for supported fields.
