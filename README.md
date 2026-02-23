# Electron + Vue + Rsbuild Starter

A modern Electron desktop application starter using Vue 3, Rsbuild, and TypeScript with WinBox.js for window-based navigation.

## Table of Contents

- [Quick Start](#quick-start)
- [Available Commands](#available-commands)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Configuration](#configuration)
- [Documentation](#documentation)
- [Potential Improvements](#potential-improvements)
- [License](#license)

---

## Quick Start

```bash
# Install dependencies
bun install

# Start development mode
bun run dev

# Build for production
bun run build

# Package for distribution
bun run dist
```

---

## Available Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Launch Electron in development mode |
| `bun run dev:web` | Start renderer dev server only |
| `bun run dev:electron` | Start Electron with dev server |
| `bun run build` | Build full application (TypeScript + frontend) |
| `bun run build:frontend` | Build frontend only |
| `bun run build:ts` | Compile TypeScript to dist-ts/ |
| `bun run dist` | Package installers with electron-builder |
| `bun run start` | Start the built Electron application |
| `bun run lint` | Run Biome linter |
| `bun run lint:fix` | Auto-fix lint issues |
| `bun run format` | Format code with Biome |
| `bun run test:security` | Run security tests |

---

## Project Structure

```
starter-electron-vue-rsbuild/
├── scripts/                          # Build and development orchestration (19 files)
│   ├── cli.mjs                       # Main CLI entry point
│   ├── commands/                     # Command implementations
│   │   ├── build.mjs                 # Build command orchestration
│   │   ├── dev.mjs                   # Development server with import fixing
│   │   └── start.mjs                 # Start built application
│   ├── core/                         # Core utilities
│   │   ├── config.mjs                # Centralized configuration
│   │   ├── errors.mjs                # Error classes and handling
│   │   └── logger.mjs                # Logging utilities
│   ├── utils/                        # Helper utilities
│   │   ├── exec.mjs                  # Command execution
│   │   ├── fs.mjs                    # File system operations
│   │   ├── network.mjs               # Port finding utilities
│   │   └── validate.mjs              # Validation utilities
│   └── backup/                       # Legacy scripts (reference only)
│       ├── build-electron.mjs
│       ├── build-frontend.mjs
│       ├── build.mjs
│       ├── check-dependencies.mjs
│       ├── dev-electron.mjs
│       ├── fix-imports.js
│       ├── main.mjs
│       └── start.mjs
│
├── src/
│   ├── main/                         # Electron main process (20 files)
│   │   ├── main.ts                   # Production entry point
│   │   ├── main.dev.ts               # Development entry point
│   │   ├── di/                       # Dependency injection (4 files)
│   │   │   ├── main-container.ts     # Main process DI container
│   │   │   ├── service-providers.ts  # Service registration
│   │   │   ├── tokens.ts             # DI injection tokens
│   │   │   └── index.ts
│   │   ├── events/                   # Event bus system (4 files)
│   │   │   ├── main-event-bus.ts     # Main process event bus
│   │   │   ├── ipc-handlers.ts       # IPC event handlers
│   │   │   ├── examples.ts           # Usage examples
│   │   │   └── index.ts
│   │   ├── use-cases/                # Business logic (14 files)
│   │   │   ├── app-service.ts        # App service interface
│   │   │   ├── app-service-instance.ts
│   │   │   ├── file-service.ts       # File service interface
│   │   │   ├── file-service-instance.ts
│   │   │   ├── window-service.ts     # Window service interface
│   │   │   ├── window-service-instance.ts
│   │   │   ├── electron-intro.ts     # Feature use cases
│   │   │   ├── electron-architecture.ts
│   │   │   ├── electron-security.ts
│   │   │   ├── electron-packaging.ts
│   │   │   ├── electron-native-apis.ts
│   │   │   ├── electron-performance.ts
│   │   │   ├── electron-development.ts
│   │   │   ├── electron-versions.ts
│   │   │   ├── index.ts
│   │   │   └── use-cases-index.ts
│   │   └── lib/                      # Utilities (4 files)
│   │       ├── filesystem-utils.ts   # File operations
│   │       ├── ipc-utils.ts          # IPC helpers
│   │       ├── process-utils.ts      # Process management
│   │       └── window-utils.ts       # Window creation (1024x640 default)
│   │
│   ├── renderer/                     # Vue renderer process (40+ files)
│   │   ├── main.ts                   # Vue app entry point
│   │   ├── components/               # Vue components (2 files)
│   │   │   ├── App.vue               # Root component
│   │   │   └── Sidebar.vue           # Sidebar with window list
│   │   ├── use-cases/                # View components (8 Vue files)
│   │   │   ├── ElectronIntro.vue
│   │   │   ├── ElectronArchitecture.vue
│   │   │   ├── ElectronSecurity.vue
│   │   │   ├── ElectronPackaging.vue
│   │   │   ├── ElectronNativeAPIs.vue
│   │   │   ├── ElectronPerformance.vue
│   │   │   ├── ElectronDevelopment.vue
│   │   │   ├── ElectronVersions.vue
│   │   │   └── index.ts
│   │   ├── composables/              # Vue composables (8 files)
│   │   │   ├── useInject.ts          # DI composable
│   │   │   ├── useEventBus.ts        # Event bus composable
│   │   │   ├── useWinBoxNavigation.ts # WinBox router composable
│   │   │   ├── useIPC.ts             # IPC composable
│   │   │   ├── useWindow.ts          # Window composable
│   │   │   ├── useAppInfo.ts         # App info composable
│   │   │   ├── windowManager.js      # Window manager (legacy)
│   │   │   └── index.ts
│   │   ├── router/                   # WinBox router (3 files)
│   │   │   ├── winbox-router.ts      # Router implementation
│   │   │   ├── views.ts              # View registry
│   │   │   └── index.ts
│   │   ├── api/                      # API layer (6 files)
│   │   │   ├── base.api.ts           # Base API client
│   │   │   ├── file.api.ts           # File API
│   │   │   ├── app.api.ts            # App API
│   │   │   ├── window.api.ts         # Window API
│   │   │   ├── system.api.ts         # System API
│   │   │   └── index.ts
│   │   ├── services/                 # Renderer services (12 files)
│   │   │   ├── window-factory.ts     # WinBox factory (auto-maximize)
│   │   │   ├── window-service.ts     # Window service
│   │   │   ├── ipc-service.ts        # IPC service
│   │   │   ├── window-generator.ts   # Window content generator
│   │   │   └── [electron-*]-window.ts # Feature window services
│   │   ├── stores/                   # Pinia stores (2 files)
│   │   │   ├── pinia.ts              # Pinia setup
│   │   │   └── windowStore.ts        # Window state management
│   │   ├── events/                   # Renderer events (2 files)
│   │   │   ├── renderer-event-bus.ts
│   │   │   └── index.ts
│   │   ├── windows/                  # WinBox windows (2 files)
│   │   │   ├── index.ts              # Window manager
│   │   │   └── types.ts              # Window types
│   │   ├── lib/                      # Utilities (2 files)
│   │   │   ├── dom.ts                # DOM utilities
│   │   │   └── events.ts             # Event utilities
│   │   ├── styles/                   # Global styles (2 files)
│   │   │   ├── App.css               # App styles (WinBox dark theme)
│   │   │   └── global.css            # Global styles
│   │   ├── assets/                   # Static assets
│   │   │   ├── icons/                # App icons
│   │   │   └── images/               # Images
│   │   ├── views/                    # Screen-level components (empty)
│   │   ├── reset.css                 # CSS reset
│   │   └── index.css                 # Main styles
│   │
│   ├── shared/                       # Shared code (25 files)
│   │   ├── di/                       # DI core (5 files)
│   │   │   ├── di-container.ts       # Container implementation
│   │   │   ├── injection-token.ts    # Token class
│   │   │   ├── injectable.ts         # Injectable decorator
│   │   │   ├── service-metadata.ts   # Service metadata
│   │   │   └── index.ts
│   │   ├── events/                   # Event bus core (4 files)
│   │   │   ├── event-bus.ts          # Core implementation
│   │   │   ├── types.ts              # Event types
│   │   │   ├── definitions.ts        # Event definitions
│   │   │   └── index.ts
│   │   ├── ipc/                      # IPC utilities (3 files)
│   │   │   ├── channels.ts           # Channel definitions
│   │   │   ├── handlers.ts           # Handler utilities
│   │   │   └── index.ts
│   │   ├── errors/                   # Error handling (4 files)
│   │   │   ├── base.error.ts         # Base error class
│   │   │   ├── ipc.error.ts          # IPC errors
│   │   │   ├── validation.error.ts   # Validation errors
│   │   │   └── index.ts
│   │   ├── config/                   # Configuration (3 files)
│   │   │   ├── env.config.ts         # Environment config
│   │   │   ├── app.config.ts         # App config
│   │   │   └── index.ts
│   │   ├── types/                    # TypeScript types (3 files)
│   │   │   ├── electron-api.ts       # Electron API types
│   │   │   ├── entities.ts           # Entity types
│   │   │   └── ipc-channels.ts       # IPC channel types
│   │   ├── contracts/                # Interface contracts (1 file)
│   │   │   └── api-contracts.ts
│   │   ├── core/                     # Core utilities (2 files)
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   └── constants.ts              # Global constants
│   │
│   ├── preload.ts                    # Preload script (secure IPC)
│   ├── shims-vue.d.ts                # Vue type declarations
│   └── __tests__/                    # Tests (1 file)
│       └── security.test.ts
│
├── docs/                             # Documentation (15 files)
│   ├── README.md                     # Documentation index
│   ├── architecture.md               # Architecture guide
│   ├── development.md                # Development workflow
│   ├── build-packaging.md            # Build and packaging
│   ├── ipc.md                        # IPC communication
│   ├── EVENT_BUS.md                  # Event bus documentation
│   ├── WINBOX_ROUTER.md              # WinBox router docs
│   ├── DEPENDENCY_INJECTION.md       # DI documentation
│   ├── testing.md                    # Testing guide
│   ├── deployment.md                 # Deployment guide
│   ├── troubleshooting.md            # Troubleshooting
│   ├── configuration.md              # Configuration guide
│   ├── features-and-capabilities.md
│   ├── ai-agents.md                  # AI agent guide
│   └── contributing.md               # Contribution guide
│
├── build/                            # Frontend build output (Rsbuild)
├── dist/                             # Packaged Electron artifacts
├── dist-ts/                          # TypeScript compilation output
├── reports/                          # Test and analysis reports
│   ├── security-test-report.json
│   └── security-report.json
│
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── tsconfig.main.json                # Main process TS config
├── tsconfig.node.json                # Node TS config
├── rsbuild.config.ts                 # Rsbuild configuration
├── biome.json                        # Biome (linter/formatter) config
├── index.css                         # Root styles
├── reset.css                         # CSS reset
└── LICENSE
```

### File Count Summary

| Directory | Files | Purpose |
|-----------|-------|---------|
| scripts/ | 19 | Build and development orchestration |
| src/main/ | 20 | Electron main process |
| src/renderer/ | 40+ | Vue renderer process |
| src/shared/ | 25 | Shared utilities and types |
| docs/ | 15 | Documentation |
| **Total** | **120+** | Source files |

---

## Architecture Overview

### Three-Process Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Electron App                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐      │
│  │  Main Process    │◄───────►│ Renderer Process │      │
│  │  (Node.js)       │   IPC   │ (Vue 3 + WinBox) │      │
│  │                  │         │                  │      │
│  │  - Window mgmt   │         │  - UI components │      │
│  │  - File system   │         │  - WinBox router │      │
│  │  - Native APIs   │         │  - State (Pinia) │      │
│  │  - Event bus     │         │  - Event bus     │      │
│  └──────────────────┘         └──────────────────┘      │
│           ▲                              ▲               │
│           │                              │               │
│           └──────────┬───────────────────┘               │
│                      │                                   │
│              ┌───────▼────────┐                          │
│              │ Preload Script │                          │
│              │ (Secure Bridge)│                          │
│              └────────────────┘                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **WinBox.js as Router**: Uses floating windows instead of URL-based routing
2. **Event Bus System**: Cross-process communication with type safety
3. **Dependency Injection**: Centralized DI container for both processes
4. **API Layer**: Type-safe abstraction over IPC calls
5. **Use Case Pattern**: Business logic separated from UI and services
6. **Auto-Maximize Windows**: WinBox windows open maximized, respecting sidebar

---

## Key Features

### Development Experience

- TypeScript with strict mode enabled
- Hot Module Replacement (HMR) in development
- Unified CLI for all development tasks
- Biome for unified linting and formatting
- Comprehensive documentation (15 files)
- ES module import auto-fixing

### Architecture

- Clean separation between main and renderer processes
- Dependency injection for testability
- Event bus for decoupled communication
- WinBox.js window-based navigation
- Type-safe IPC with predefined channels
- Auto-maximize windows respecting sidebar (300px)

### Security

- Context isolation enabled
- Preload script for secure API exposure
- Content Security Policy ready
- Input validation on IPC calls
- Security test suite included

### Build and Distribution

- Rsbuild for fast builds (Rust-powered)
- electron-builder for packaging
- Cross-platform support (Windows, macOS, Linux)
- Multiple installer formats (MSI, DMG, AppImage, deb)

### Window Management

- WinBox.js for floating windows
- Auto-maximize on creation
- Sidebar-aware positioning (300px offset)
- Window state management via Pinia
- Minimize/hide behavior customization

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Electron | 40.x | Desktop application framework |
| Vue | 3.5.x | UI framework |
| TypeScript | 5.9.x | Type safety |
| Rsbuild | 1.7.x | Build tool (Rust-powered) |
| Pinia | 3.0.x | State management |
| WinBox | 0.2.x | Window management/router |

### Development Tools

| Tool | Purpose |
|------|---------|
| Biome | Linting and formatting |
| electron-builder | Packaging and distribution |
| concurrently | Run multiple commands |
| tsc-alias | TypeScript path alias resolution |
| tsconfig-paths | TypeScript path mapping |

---

## Configuration

### TypeScript

Path aliases configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "outDir": "./dist-ts"
  }
}
```

### Rsbuild

Configured in `rsbuild.config.ts`:

- Entry: `src/renderer/main.ts`
- Output: `./build`
- Vue plugin enabled
- Type checking enabled
- Dev server on port 3000 (auto-finds available port)

### Biome

Configured in `biome.json`:

- 2-space indentation
- Single quotes
- Semicolons required
- Ignores build output directories

### Electron Window Defaults

- Default size: 1024x640 pixels
- Minimum size: 640x480 pixels
- Context isolation: enabled
- Node integration: disabled (security)

### WinBox Window Defaults

- Auto-maximize: enabled
- Sidebar offset: 300px + 16px gaps
- Theme: dark
- Border: 4px

---

## Documentation

Comprehensive documentation is available in the `docs/` directory:

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System design and process boundaries |
| [Development](docs/development.md) | Development workflow guide |
| [Build & Packaging](docs/build-packaging.md) | Production build process |
| [IPC Guide](docs/ipc.md) | Inter-process communication |
| [Event Bus](docs/EVENT_BUS.md) | Event system documentation |
| [WinBox Router](docs/WINBOX_ROUTER.md) | Window-based navigation |
| [Dependency Injection](docs/DEPENDENCY_INJECTION.md) | DI system guide |
| [Testing](docs/testing.md) | Testing strategies |
| [Deployment](docs/deployment.md) | Distribution process |
| [Troubleshooting](docs/troubleshooting.md) | Common issues and solutions |
| [Configuration](docs/configuration.md) | Configuration guide |
| [Features](docs/features-and-capabilities.md) | Complete feature list |
| [AI Agents](docs/ai-agents.md) | AI agent guide |
| [Contributing](docs/contributing.md) | Contribution guide |

---

## Potential Improvements

The following suggestions focus on project structure improvements for better modularity and scalability. No code changes are suggested, only organizational improvements.

### High Priority

#### 1. Consolidate Use-Cases Directory Structure

**Current Issue:** The `use-cases/` directories in both main and renderer contain mixed concerns. The main process has 14 files mixing services, use cases, and service instances. The renderer has 8 Vue components in `use-cases/` which should be in `views/` or `components/`.

**Suggested Structure:**
```
src/main/
├── services/           # Core services (stateless utilities)
│   ├── window.service.ts
│   ├── file.service.ts
│   └── app.service.ts
├── handlers/           # IPC handlers
│   ├── app.handler.ts
│   ├── file.handler.ts
│   └── window.handler.ts
└── use-cases/          # Business logic only
    ├── get-system-info.use-case.ts
    └── manage-window.use-case.ts

src/renderer/
├── views/              # Move use-cases/*.vue here
│   ├── ElectronIntro.vue
│   ├── ElectronArchitecture.vue
│   └── ...
└── use-cases/          # Remove or repurpose for business logic
```

**Benefit:** Clearer separation of concerns, easier to find files, better scalability.

#### 2. Remove or Populate Empty Directories

**Current Issue:** Several directories exist but are empty or underutilized:
- `src/renderer/views/` - Empty, but use-cases/ has 8 Vue files
- `src/main/handlers/` - Empty directory
- `src/shared/utils/` - Does not exist (should be in src/shared/core/)
- `src/shared/core/` - Only 2 files, unclear purpose

**Suggested Actions:**
- Move Vue components from `use-cases/` to `views/`
- Either populate `handlers/` with IPC handlers or remove it
- Consolidate `core/` utilities into a single `utils/` directory
- Remove empty directories to reduce confusion

**Benefit:** Reduced cognitive load, clearer project structure.

#### 3. Consolidate Window Management

**Current Issue:** Window management is spread across 7 different locations with overlapping responsibilities:
- `src/renderer/services/window-factory.ts` - Window creation
- `src/renderer/services/window-service.ts` - Window service
- `src/renderer/windows/index.ts` - Window manager
- `src/renderer/stores/windowStore.ts` - Pinia store
- `src/renderer/composables/windowManager.js` - Legacy composable
- `src/renderer/composables/useWinBoxNavigation.ts` - Router composable
- `src/renderer/router/winbox-router.ts` - Router implementation

**Suggested Structure:**
```
src/renderer/features/windows/
├── window-manager.ts       # Single source of truth
├── window-factory.ts       # Window creation
├── window-store.ts         # Pinia store
├── useWindowManager.ts     # Main composable
├── useWinBoxNavigation.ts  # Navigation composable
└── types.ts                # Types
```

**Benefit:** Single source of truth, easier to maintain, reduced duplication.

#### 4. Consolidate Legacy and Active Scripts

**Current Issue:** The `scripts/` directory has both active and backup scripts mixed together. The `backup/` folder contains 8 legacy files that may cause confusion.

**Current Structure:**
```
scripts/
├── cli.mjs                 # Active
├── build.mjs               # Active (duplicate?)
├── dev.mjs                 # Active (duplicate?)
├── commands/               # Active
│   ├── build.mjs
│   ├── dev.mjs
│   └── start.mjs
└── backup/                 # Legacy (8 files)
```

**Suggested Structure:**
```
scripts/
├── cli.mjs                 # Single entry point
├── commands/               # All commands
│   ├── build.mjs
│   ├── dev.mjs
│   └── start.mjs
├── core/                   # Core utilities
├── utils/                  # Helper utilities
└── legacy/                 # Renamed from backup
    └── [document what was deprecated and why]
```

**Benefit:** Clearer distinction between active and legacy code.

#### 5. Implement Feature-Based Organization

**Current Issue:** Type-based organization (components, services, composables) becomes difficult to navigate as the project grows beyond 50 components.

**Suggested Structure for Large Projects:**
```
src/renderer/
├── features/
│   ├── window-management/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── services/
│   │   └── index.ts
│   ├── file-operations/
│   │   ├── components/
│   │   ├── composables/
│   │   └── index.ts
│   └── settings/
│       ├── components/
│       └── composables/
├── shared/
│   ├── components/
│   └── composables/
└── app/
    ├── stores/
    └── main.ts
```

**When to Implement:** When the project exceeds 50 components or 10,000 lines of code.

**Benefit:** Better scalability, easier to find feature-related code.

### Medium Priority

#### 6. Standardize File Naming Conventions

**Current Issue:** Inconsistent naming conventions across the project:
- Services: `window-service.ts` vs `windowService.ts` (kebab-case vs camelCase)
- Use cases: `electron-intro.ts` vs `ElectronIntro.vue`
- Composables: `useWinBoxNavigation.ts` vs `windowManager.js`
- Mixed patterns: `main-container.ts` vs `renderer-container.ts`

**Suggested Convention:**
- Services: `*.service.ts`
- Use cases: `*.use-case.ts`
- Handlers: `*.handler.ts`
- Composables: `use*.ts`
- Stores: `use*Store.ts`
- Components: `*.vue` (PascalCase for components)
- Utilities: `*.util.ts` or `*-utils.ts`

**Benefit:** Consistent naming makes files easier to find and understand.

#### 7. Add Environment Configuration Files

**Current Issue:** No `.env` files exist for environment-specific configuration. Configuration is hardcoded in `scripts/core/config.mjs`.

**Suggested Addition:**
```
.env                        # Default environment
.env.development            # Development-specific
.env.production             # Production-specific
.env.test                   # Test-specific
```

**Benefit:** Easier environment management, better security for sensitive values.

#### 8. Consolidate Event Systems Documentation

**Current Issue:** Event bus exists in multiple places with potential overlap:
- `src/shared/events/` (core)
- `src/main/events/` (main process)
- `src/renderer/events/` (renderer process)
- `src/renderer/composables/useEventBus.ts` (Vue composable)

**Suggested:** Add a `README.md` in `src/shared/events/` documenting:
- When to use shared vs process-specific event buses
- Event naming conventions
- Cross-process event patterns

**Benefit:** Reduced confusion, better adoption of event system.

#### 9. Add Module Index Files

**Current Issue:** Some modules lack proper index files for clean imports. For example, `src/shared/core/` has `index.ts` but `src/shared/contracts/` does not.

**Suggested:** Ensure every module directory has an `index.ts` that exports public APIs:
```
src/shared/contracts/index.ts
src/shared/utils/index.ts
src/main/handlers/index.ts (if created)
```

**Benefit:** Cleaner imports, better encapsulation.

#### 10. Separate Test Files from Source

**Current Issue:** Tests are mixed with source files (`src/__tests__/security.test.ts`) but there's no clear testing structure.

**Suggested Structure:**
```
tests/
├── unit/
│   ├── main/
│   ├── renderer/
│   └── shared/
├── integration/
│   └── ipc.test.ts
└── e2e/
    └── app.test.ts
```

**Benefit:** Clearer test organization, easier to run specific test suites.

### Low Priority

#### 11. Create Shared Constants Module

**Current Issue:** Constants are scattered across files (`src/shared/constants.ts`, `src/shared/ipc/channels.ts`, etc.).

**Suggested:**
```
src/shared/constants/
├── app.constants.ts
├── ipc.constants.ts
├── window.constants.ts
└── index.ts
```

**Benefit:** Centralized constants, easier to maintain.

#### 12. Document Module Dependencies

**Current Issue:** Module dependencies are implicit. It's unclear which modules depend on which.

**Suggested:** Add `DEPENDENCIES.md` in each major module documenting:
- What modules it depends on
- What modules depend on it
- Circular dependency warnings

**Benefit:** Better understanding of module relationships, easier refactoring.

#### 13. Add Build Output Analysis

**Current Issue:** No automated bundle size tracking or analysis.

**Suggested:** Add to package.json scripts:
```json
{
  "scripts": {
    "analyze": "rsbuild --analyze",
    "report": "open build/stats.html"
  }
}
```

**Benefit:** Better bundle size awareness, easier optimization.

#### 14. Consolidate CSS Files

**Current Issue:** CSS files are scattered:
- `./index.css` (root)
- `./reset.css` (root)
- `src/renderer/index.css`
- `src/renderer/reset.css`
- `src/renderer/styles/App.css`
- `src/renderer/styles/global.css`

**Suggested:**
```
src/renderer/styles/
├── reset.css               # CSS reset
├── variables.css           # CSS variables
├── global.css              # Global styles
├── components/             # Component-specific styles
└── winbox.css              # WinBox-specific styles
```

**Benefit:** Clearer style organization, easier maintenance.

#### 15. Consider Monorepo Structure for Future Growth

**Current Issue:** As features grow, single repo may become unwieldy.

**Suggested Future Structure (if needed):**
```
packages/
├── core/                 # Shared core (DI, events, errors)
├── main-process/         # Main process code
├── renderer/             # Renderer code
├── ui-components/        # Reusable UI components
└── app/                  # Main application
```

**When to Consider:** When the project exceeds 50,000 lines of code or multiple teams work on it.

**Benefit:** Better separation of concerns, independent versioning.

---

## Summary of Improvement Priorities

| Priority | Count | Focus Areas |
|----------|-------|-------------|
| High | 5 | Directory consolidation, empty directories, window management, script organization, feature-based structure |
| Medium | 5 | Naming conventions, environment config, event documentation, index files, test organization |
| Low | 5 | Constants, dependency docs, build analysis, CSS consolidation, monorepo consideration |

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Contributing

See [docs/contributing.md](docs/contributing.md) for contribution guidelines.

---

## Support

For issues and questions:
1. Check [documentation](docs/)
2. Review [troubleshooting guide](docs/troubleshooting.md)
3. Open an issue on GitHub
