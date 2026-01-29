# Electron + Vue.js + Rsbuild Starter

A modern Electron + Vue.js boilerplate using Rsbuild and Bun runtime. This starter provides a fast, efficient development environment with hot reloading and optimized production builds.

## Features

- Fast Bundling: Powered by Rsbuild for lightning-fast builds
- Vue 3: Latest Vue.js with Composition API support
- Electron Integration: Desktop application packaging (runtime dependency moved to devDependencies for production builds)
- TypeScript Ready: Full type safety
- Modern Styling: Dark mode friendly UI
- Development Tools: Hot reloading and debugging support
- Optimized Builds: Tree-shaking and code splitting

## Tech Stack

- Framework: Vue.js 3 (Composition API)
- Bundler: Rsbuild (configuration in root directory)
- Runtime: Bun (fast JavaScript runtime)
- Desktop: Electron (runtime dependency moved to devDependencies for production builds)
- Styling: CSS with variables and responsive design
- Type Checking: TypeScript
- Code Quality: Biome (formatter, linter)

## Project Structure

```
starter-rsbuild-electron-vue/
├── rsbuild.config.js           # Rsbuild configuration
├── scripts/                    # Build and development scripts
│   └── build.mjs              # Build script
├── src/                        # Source code
│   ├── lib/                    # Library files
│   ├── renderer/               # Vue application source
│   │   ├── assets/             # Static assets (icons, images)
│   │   ├── components/         # Vue components
│   │   ├── lib/                # Utility libraries
│   │   ├── styles/             # CSS styles
│   │   ├── App.vue             # Main application component
│   │   ├── index.html          # HTML template
│   │   └── main.js             # Entry point
│   ├── main-dev.cjs            # Electron main process (development)
│   ├── main.cjs                # Electron main process (production)
│   └── preload.cjs             # Electron preload script
├── build/                      # Temporary build output (for running app)
├── dist/                       # Production distribution output
├── package.json                # Project metadata, scripts, and Electron main entry point
└── README.md                   # This file
```

## Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js >= 18
- npm or yarn (if not using Bun)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd starter-rsbuild-electron-vue
```

2. Install dependencies:
```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

## Development

### Starting the Development Server

```bash
# Start the development server with Electron app
bun run dev

# Or start the Electron development environment separately
bun run dev:electron
```

This command will:
- Start the Rsbuild development server
- Launch the Electron application
- Enable hot reloading for both renderer and main processes

Note: The development server has been tested and works correctly.

### Development Scripts

- `bun run dev` - Start development server with Electron app
- `bun run dev:electron` - Start the Electron development environment
- `bun run build:frontend` - Build frontend only using Rsbuild
- `bun run start` - Start the built Electron application

## Building for Production

### Building the Application

```bash
# Build the application for production
bun run build
```

This command will:
- Clean the previous build directory
- Bundle the application using Rsbuild
- Copy necessary assets to the build directory for running the app locally

Note: The production build has been tested and works correctly, creating all necessary files in the ./build directory for local execution.

### Creating Distribution Packages

```bash
# Create distributable packages (AppImage, etc.)
bun run dist
```

This command will:
- Run the build process
- Package the application using electron-builder
- Generate platform-specific installers in the ./dist directory
- Clean up the intermediate ./build directory after packaging

Note: On some Linux distributions, the .deb packaging may fail due to system library dependencies (such as libcrypt.so.1). The AppImage format will still be created successfully and is the recommended distribution format for Linux systems. After packaging, only the ./dist directory will remain.

## Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start development server with Electron app |
| `dev:electron` | Start the Electron development environment |
| `build` | Build application for production (output to ./build) |
| `build:frontend` | Build frontend only (output to ./build) |
| `dist` | Create distributable packages (output to ./dist, cleans ./build) |
| `start` | Start the built Electron application (requires ./build from 'bun run build') |
| `lint` | Check code for linting errors |
| `lint:fix` | Automatically fix linting errors |
| `format` | Format code with Biome |

## Configuration Files

- `rsbuild.config.js` - Rsbuild configuration (in root directory)
- `tsconfig.json` - TypeScript configuration
- `biome.json` - Biome formatter and linter configuration
- `package.json` - Project metadata, scripts, and Electron main entry point

## Key Components

### Window Management
The project includes a sophisticated window management system using WinBox, allowing for:
- Draggable and resizable windows
- Minimize/maximize/close functionality
- Custom styling and themes
- Multiple window instances

### Services
- WinBox Service: Manages desktop-like windows within the application
- Window Content Generator: Creates dynamic content for windows

### Composables
- useDarkMode: Toggle between light and dark themes
- useWindows: Manage multiple windows in the application

## Environment

This starter uses Bun as the JavaScript runtime, which provides:
- Faster package installation compared to npm
- Built-in bundler, transpiler, and test runner
- Better performance for development workflows

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [GitHub Issues](https://github.com/your-username/starter-rsbuild-electron-vue/issues) page
2. Create a new issue with detailed information about the problem
3. Include your environment information (OS, Bun/Node version, etc.)

## Acknowledgments

- [Rsbuild](https://rsbuild.dev/) - Fast, extensible build tool
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [Electron](https://www.electronjs.org/) - Build cross-platform desktop apps
- [Bun](https://bun.sh/) - Fast JavaScript runtime
- [WinBox](https://nextapps-de.github.io/winbox/) - Lightweight window manager