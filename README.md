# Enterprise Desktop Application Framework

A production-ready Electron + Vue.js starter kit featuring Rsbuild for high-performance desktop applications. This framework delivers optimized builds, comprehensive tooling, and modular architecture for scalable desktop solutions.

## Core Features

- **High-Performance Bundling**: Rsbuild-powered compilation with incremental builds and optimized output
- **Modern Frontend Stack**: Vue 3 with Composition API, TypeScript support, and reactive data binding
- **Cross-Platform Desktop**: Electron-based deployment for Windows, macOS, and Linux
- **Modular Architecture**: Component-based design with separated concerns and scalable structure
- **Production Optimized**: Tree-shaking, code splitting, and minification for smallest possible bundles
- **Developer Experience**: Hot module replacement, comprehensive linting, and debugging tools

## Technology Stack

- **Framework**: Vue.js 3 with Composition API and TypeScript
- **Bundler**: Rsbuild with advanced optimization capabilities
- **Runtime**: Bun for accelerated development workflows
- **Desktop**: Electron with secure context isolation
- **Styling**: CSS Modules with variable-based theming system
- **Quality Assurance**: Biome for unified code formatting and linting

## Architecture Overview

```
project-root/
├── rsbuild.config.ts           # Build configuration
├── scripts/
│   ├── check-dependencies.mjs  # Dependency checking utilities
│   ├── build-frontend.mjs      # Frontend build orchestration
│   ├── build-electron.mjs      # Electron build orchestration
│   ├── dev-web.mjs             # Web development server
│   ├── dev-electron.mjs        # Electron development environment
│   └── start.mjs               # Production startup script
├── src/
│   ├── main.ts                 # Production main process
│   ├── main-dev.ts             # Development main process
│   ├── preload.ts              # Secure preload script
│   └── renderer/
│       ├── main.js             # Vue application entry
│       ├── App.vue             # Root component
│       ├── use-cases/          # Modular window components
│       ├── components/         # Reusable UI elements
│       └── styles/             # Global styling
├── build/                      # Compiled frontend application
├── dist/                       # Distribution packages
└── dist-ts/                    # Compiled TypeScript sources
```

## Quick Start

### Prerequisites
- Bun runtime (recommended) or Node.js 18+
- Git version control

### Installation
```bash
# Clone repository
git clone <repository-url>
cd <project-name>

# Install dependencies
bun install
```

### Development Workflow
```bash
# Launch development environment with HMR
bun run dev

# Build frontend only
bun run build:frontend

# Start built application
bun run start
```

### Production Deployment
```bash
# Create optimized production build
bun run build

# Generate distribution packages
bun run dist
```

## Available Commands

| Command | Purpose |
|---------|---------|
| `bun run dev` | Development server with Electron |
| `bun run dev:web` | Web development server only |
| `bun run dev:electron` | Electron development environment |
| `bun run build` | Production application build |
| `bun run build:frontend` | Frontend build only |
| `bun run build:electron` | Electron application build |
| `bun run build:ts` | TypeScript compilation |
| `bun run dist` | Create distributable packages |
| `bun run start` | Start built application |
| `bun run lint` | Code quality analysis |
| `bun run format` | Automatic code formatting |

## Modular Window System

The framework implements a component-driven window management system:

- **Individual Window Components**: Each use case is encapsulated in its own Vue component
- **Backend Integration**: Secure IPC communication between frontend and main process
- **Dynamic Content Loading**: Asynchronous data fetching with error handling
- **Consistent Theming**: Unified dark/light mode with CSS variables

## Production Capabilities

- **Secure Architecture**: Context isolation and secure IPC communication
- **Optimized Assets**: Compressed bundles with minimal overhead
- **Cross-Platform Compatibility**: Single codebase for all major desktop platforms
- **Update Ready**: Structured for integration with auto-update mechanisms

## Development Standards

- **Type Safety**: Full TypeScript coverage with strict mode
- **Code Quality**: Automated formatting and linting with Biome
- **Security**: Secure Electron configuration with preload scripts
- **Performance**: Optimized rendering and memory management

## Enterprise Benefits

- **Rapid Deployment**: Ready-to-use architecture reduces development time
- **Scalable Structure**: Modular design supports growing application complexity
- **Maintainable Code**: Clear separation of concerns and consistent patterns
- **Cost Effective**: Open-source tooling with minimal dependencies
- **Future Proof**: Modern technology stack with active community support

## Support & Maintenance

This framework follows semantic versioning and includes comprehensive documentation. Issues and feature requests are managed through the standard GitHub workflow.

## License

MIT License - suitable for both commercial and open-source projects.