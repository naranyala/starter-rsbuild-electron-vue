# Electron + Vue.js + Rsbuild Starter

A modern Electron + Vue.js boilerplate using Rsbuild and Bun runtime. This starter provides a fast, efficient development environment with hot reloading and optimized production builds.

## Features

- ⚡ **Fast Bundling**: Powered by Rsbuild for lightning-fast builds
- 🖼️ **Vue 3**: Latest Vue.js with Composition API support
- 🔌 **Electron Integration**: Desktop application packaging
- 🧪 **TypeScript Ready**: Full type safety
- 🎨 **Modern Styling**: Dark mode friendly UI
- 🛠️ **Development Tools**: Hot reloading and debugging support
- 📦 **Optimized Builds**: Tree-shaking and code splitting

## Tech Stack

- **Framework**: Vue.js 3 (Composition API)
- **Bundler**: Rsbuild
- **Runtime**: Bun (fast JavaScript runtime)
- **Desktop**: Electron
- **Styling**: CSS with variables and responsive design
- **Type Checking**: TypeScript
- **Code Quality**: Biome (formatter, linter)

## Project Structure

```
starter-rsbuild-electron-vue/
├── scripts/                 # Build and development scripts
│   ├── build-script.js     # Production build script
│   ├── dev-server.js       # Development server
│   └── rsbuild.config.js   # Rsbuild configuration
├── src/                    # Source code
│   ├── assets/             # Static assets (icons, images)
│   ├── composables/        # Vue composables
│   ├── extra_assets/       # Additional assets
│   ├── plugins/            # Vue plugins
│   ├── services/           # Application services
│   ├── types/              # TypeScript declarations
│   ├── App.vue             # Main application component
│   ├── index.html          # HTML template
│   ├── index.ts            # Entry point
│   └── ...                 # Other components
├── main.cjs                # Electron main process
├── build/                  # Production build output
├── package.json            # Dependencies and scripts
└── README.md               # This file
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
# Start the development server with hot reloading
bun run dev
```

This command will:
- Start the Rsbuild development server
- Launch the Electron application
- Enable hot reloading for both renderer and main processes

### Development Scripts

- `bun run dev` - Start development server with Electron app
- `bun run rsbuild:dev` - Start Rsbuild development server only
- `bun run rsbuild:build` - Build for production using Rsbuild only

## Building for Production

### Building the Application

```bash
# Build the application for production
bun run build
```

This command will:
- Clean the previous build directory
- Bundle the application using Rsbuild
- Copy necessary assets to the build directory

### Creating Distribution Packages

```bash
# Create distributable packages (AppImage, deb, msi, etc.)
bun run dist
```

This command will:
- Run the build process
- Package the application using electron-builder
- Generate platform-specific installers

## Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start development server with Electron app |
| `build` | Build application for production |
| `dist` | Create distributable packages |
| `rsbuild:dev` | Start Rsbuild development server |
| `rsbuild:build` | Build with Rsbuild only |
| `lint` | Check code for linting errors |
| `lint:fix` | Automatically fix linting errors |
| `format` | Format code with Biome |
| `format:check` | Check code formatting |
| `type-check` | Run TypeScript type checking |
| `type-check:watch` | Watch TypeScript files for type errors |

## Configuration Files

- `rsbuild.config.js` - Rsbuild configuration (in scripts/ directory)
- `tsconfig.json` - TypeScript configuration
- `biome.json` - Biome formatter and linter configuration
- `package.json` - Project metadata and scripts

## Key Components

### Window Management
The project includes a sophisticated window management system using WinBox, allowing for:
- Draggable and resizable windows
- Minimize/maximize/close functionality
- Custom styling and themes
- Multiple window instances

### Services
- **WinBox Service**: Manages desktop-like windows within the application
- **Window Content Generator**: Creates dynamic content for windows

### Composables
- **useDarkMode**: Toggle between light and dark themes
- **useWindows**: Manage multiple windows in the application

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