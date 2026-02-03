<div align="center">

# 🚀 Electron + Vue + Rsbuild Starter

### The Ultimate Production-Ready Desktop Application Foundation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue.js-3.x-brightgreen)](https://vuejs.org/)
[![Electron](https://img.shields.io/badge/Electron-20+-blue)](https://www.electronjs.org/)
[![Rsbuild](https://img.shields.io/badge/Rsbuild-1.x-red)](https://rsbuild.dev/)

**A cutting-edge, production-ready Electron starter that combines Vue 3, Rsbuild, and a sophisticated CLI workflow. Built for developers who demand fast iteration, optimal performance, and enterprise-grade security.**

</div>

## ✨ Why Choose This Starter?

### 🏗️ Modern Tech Stack
- **Vue 3 + Pinia** - Reactive, composable UI with intuitive state management
- **Rsbuild** - Lightning-fast builds powered by Rust (up to 10x faster than traditional bundlers)
- **Electron** - Cross-platform desktop applications with web technologies
- **TypeScript** - Enhanced developer experience with strong typing
- **Biome** - Unified code formatting and linting in a single tool

### ⚡ Performance Optimized
- **Instant HMR** - Hot Module Replacement for immediate feedback during development
- **Fast Bundling** - Rsbuild delivers blazing-fast build times and optimized output
- **Efficient Architecture** - Three-process design with proper separation of concerns
- **Smart Code Splitting** - Optimized bundle sizes for faster loading

### 🔒 Enterprise Security
- **Context Isolation** - Secure communication between processes
- **Preload API** - Safely expose system APIs to the renderer
- **Security-First Design** - Production-ready security configurations out-of-the-box
- **CSP Compliance** - Content Security Policy for protection against XSS

### 🛠️ Developer Experience
- **Single CLI Entry Point** - Unified interface for all development tasks
- **Comprehensive Documentation** - AI-friendly docs for both humans and automation
- **Modular Architecture** - Clean separation of concerns for maintainable code
- **Production Ready** - Includes packaging, distribution, and optimization tools

### 🌐 Cross-Platform Support
- **Windows, macOS, Linux** - Single codebase for all major desktop platforms
- **Professional Installers** - MSI, DMG, AppImage, and DEB packages included
- **Consistent UX** - Native-like experience across all platforms

## 🚀 Quick Start

Get up and running in seconds:

```bash
# Clone and install dependencies
bun install

# Start development mode
bun run dev
```

Alternative with Node.js:
```bash
npm install
npm run dev
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Launch Electron in development mode (full app) |
| `bun run dev:web` | Start renderer dev server only |
| `bun run dev:electron` | Start Electron development with dev server |
| `bun run build` | Build full application for production |
| `bun run build:frontend` | Build renderer only |
| `bun run build:ts` | Compile TypeScript to `dist-ts/` |
| `bun run build:electron` | Build Electron application |
| `bun run dist` | Package installers with electron-builder |
| `bun run start` | Start the built Electron application |
| `bun run cli` | Access the unified CLI tool |
| `bun run lint` | Run Biome linter |
| `bun run lint:fix` | Auto-fix lint issues |
| `bun run format` | Format code with Biome |

## 🏗️ Architecture Overview

### Three-Process Architecture
- **Main Process**: `src/main.ts` (production) & `src/main-dev.ts` (development)
- **Preload Process**: `src/preload.ts` (secure API exposure)
- **Renderer Process**: `src/renderer/main.ts` (Vue 3 application)

### Project Structure
```
.
├── build/                  # Renderer build output (Rsbuild)
├── dist/                   # Packaged Electron artifacts
├── dist-ts/                # Compiled TypeScript output
├── docs/                   # Comprehensive documentation
├── scripts/                # CLI and build orchestration
├── src/
│   ├── main/               # Main-process services and handlers
│   ├── renderer/           # Vue application (components, views, stores)
│   ├── shared/             # Shared types and utilities
│   ├── main.ts             # Production Electron main process
│   ├── main-dev.ts         # Development Electron main process
│   ├── preload.ts          # Secure preload API surface
│   └── shims-vue.d.ts      # TypeScript shims for Vue
├── rsbuild.config.ts       # Rsbuild configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## 📚 Documentation

Comprehensive guides for developers and AI agents:

- [Getting Started](./docs/README.md) - Project overview and quick start
- [AI Agent Guide](./docs/ai-agents.md) - Automation-friendly documentation
- [Architecture Deep Dive](./docs/architecture.md) - Detailed system design
- [Development Workflow](./docs/development.md) - Complete development guide
- [IPC and Preload](./docs/ipc.md) - Secure inter-process communication
- [Build & Packaging](./docs/build-packaging.md) - Production build process
- [Features & Capabilities](./docs/features-and-capabilities.md) - Complete feature list
- [Configuration](./docs/configuration.md) - Advanced customization options
- [Testing](./docs/testing.md) - Quality assurance strategies
- [Deployment](./docs/deployment.md) - Distribution and release process
- [Troubleshooting](./docs/troubleshooting.md) - Common issues and solutions

## 🔧 Advanced Features

### IPC Communication
- **Secure API Exposure** - Preload script safely exposes system APIs
- **Structured Responses** - Consistent `{ success, data | error }` format
- **Type Safety** - Full TypeScript support for IPC calls
- **Error Handling** - Robust error management across processes

### Window Management
- **Advanced Window Controls** - Customizable window behavior
- **Multi-Window Support** - Handle complex application layouts
- **Lifecycle Management** - Proper resource cleanup and memory management

### State Management
- **Pinia Stores** - Intuitive, type-safe state management
- **Cross-Process State** - Synchronized state between processes
- **Persistence** - Automatic state persistence options

## 🎯 Use Cases

Perfect for building:
- **Productivity Apps** - Task managers, note-taking applications
- **Developer Tools** - Code editors, API clients, database tools
- **Creative Software** - Design tools, media applications
- **Business Applications** - CRM, ERP, dashboard applications
- **Utilities** - System tools, file managers, converters

## 🚀 Deployment & Distribution

### Professional Packaging
- **Cross-Platform Installers** - MSI (Windows), DMG (macOS), AppImage (Linux)
- **Auto-Updater Ready** - Built-in support for application updates
- **Code Signing** - Prepare for platform-specific distribution
- **Size Optimization** - Efficient bundle sizes for fast downloads

### Distribution Channels
- **Direct Download** - Self-hosted installation packages
- **Platform Stores** - Mac App Store, Microsoft Store compatibility
- **Enterprise Deployment** - Bulk installation for organizations

## 🤖 AI Agent Friendly

This starter is designed for both human developers and AI automation:

- **Machine-Readable Documentation** - Structured docs for AI consumption
- **Consistent Patterns** - Predictable architecture for automated modifications
- **Clear Conventions** - Well-defined coding standards and practices
- **Safe Refactoring Zones** - Identified areas for safe automated changes

## 🛡️ Security Features

- **Context Isolation Enabled** - Secure separation between renderer and Node.js
- **CSP Headers** - Protection against cross-site scripting
- **Input Validation** - Sanitized data flow between processes
- **Secure IPC** - Protected communication channels

## 📈 Performance Benchmarks

- **Build Speed**: Up to 10x faster than traditional bundlers
- **Startup Time**: Optimized for quick application launch
- **Memory Usage**: Efficient resource management
- **Bundle Size**: Minified and optimized for distribution

## 🤝 Contributing

We welcome contributions! Check out our [documentation](./docs/contributing.md) for guidelines on how to contribute to this project.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using the amazing Vue 3 ecosystem
- Powered by the incredibly fast Rsbuild bundler
- Supported by the robust Electron framework
- Maintained with Biome for consistent code quality

---

<div align="center">

**Ready to build the next-generation desktop application?**

⭐ Star this repository if you find it useful!

</div>
