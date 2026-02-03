# IPC And Preload

The preload script exposes a typed API to the renderer and routes calls through IPC channels in the main process.

## Preload Surface
The preload API is available on `window.electronAPI` and includes:
- `fs`, `dialog`, `window`, `app`, `system`
- `process`, `ipc`, `clipboard`, `notification`, `menu`, `shell`

See `src/preload.ts` for the full surface.

## Handler Registration
- Development main process: `src/main-dev.ts` registers the full set of IPC handlers for the preload API.
- Production main process: `src/main.ts` registers app/system handlers from `src/main/lib/ipc-utils.ts`.
- Production main process: `src/main.ts` registers use-case handlers from `src/main/handlers/*`.
- Production main process: `src/main.ts` includes a basic `ping` handler.

If you need a preload API to work in production, add the corresponding handler in `src/main.ts` or a shared main module.

## IPC Helper Conventions
`src/main/lib/ipc-utils.ts` provides a wrapper that returns structured responses:
- Success: `{ success: true, data: ... }`
- Error: `{ success: false, error: ... }`

When adding new handlers, prefer `registerHandler` so the renderer receives consistent responses.

## Use-Case Handlers
The use-case handlers in `src/main/handlers` are example IPC endpoints that return static content (HTML strings and metadata). These are safe to expand or replace with real data access layers.
