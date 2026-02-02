# Scripts Refactoring Summary

## Overview
All scripts in `./scripts` have been completely refactored into a new modular format with:
- **Enhanced error handling** using custom error classes and proper propagation
- **Modular architecture** with clear separation of concerns
- **Consistent logging** using the enhanced Logger with color-coded output
- **Async/await pattern** throughout for better flow control
- **Unified CLI** via `cli.mjs` for all operations
- **Improved validation** with dedicated validation utilities

## New Structure

### Core Modules (scripts/core/)
- `errors.mjs` - Comprehensive error handling with custom error classes:
  - `ScriptError` - Base error class with context
  - `BuildError` - Build-specific errors with codes
  - `ValidationError` - Input validation errors
  - `ProcessError` - Process execution errors
  - `NetworkError` - Network-related errors
  - `FileSystemError` - File system operation errors
  
- `logger.mjs` - Enhanced logging system:
  - Multiple log levels (ERROR, WARN, INFO, DEBUG, TRACE)
  - Colored output with timestamps
  - JSON output mode for CI/CD
  - Task lifecycle tracking (start/complete/failed)
  - Progress bars and tables
  - Child loggers with prefixes
  
- `config.mjs` - Centralized configuration management:
  - Environment-based defaults
  - CLI argument parsing
  - Local config file support
  - Path resolution utilities

### Utility Modules (scripts/utils/)
- `fs.mjs` - File system operations:
  - `readFile`, `writeFile`, `copy`, `move`, `remove`
  - `mkdir`, `exists`, `isFile`, `isDirectory`
  - `walk` for recursive directory traversal
  - `readJson`, `writeJson` for JSON files
  - `findByExtension` for file discovery
  
- `exec.mjs` - Process execution:
  - `execSyncSafe` - Safe synchronous execution
  - `execSyncOrFail` - Throws on failure
  - `execAsync` - Async with streaming output
  - `createProcessManager` - Process lifecycle management
  - `npm`, `npx` helpers
  
- `network.mjs` - Network utilities:
  - `isPortAvailable` - Check port availability
  - `findAvailablePort` - Find random available port
  - `waitForPort`, `waitForUrl` - Wait for services
  - `ping`, `hasInternetConnection`
  
- `validate.mjs` - Input validation:
  - `validatePort`, `validatePath`, `validateUrl`
  - `validateNonEmptyString`, `validateRange`
  - `validateEnum`, `validateRequired`
  - `validateJson`, `validateSemver`

### Command Modules (scripts/commands/)
- `dev.mjs` - Development commands:
  - `startDevWeb()` - Web development server
  - `startDevElectron()` - Electron with HMR
  - `fixImports()` - Fix ES module imports
  
- `build.mjs` - Build commands:
  - `build()` - Full build pipeline
  - `buildFrontend()` - Frontend only
  - `compileTypeScript()` - TypeScript compilation
  - `packageElectron()` - Package with electron-builder
  - `buildDist()` - Production build with packaging
  
- `start.mjs` - Application startup:
  - `startApp()` - Start built Electron app

### Entry Point
- `cli.mjs` - Unified CLI interface:
  - Command routing and validation
  - Argument parsing
  - Help and version display
  - Error handling at top level

## Key Improvements

### 1. Error Handling
```javascript
// Before
execSync('some-command'); // Throws on error, no context

// After
try {
  await execAsync('some-command', { timeout: 30000 });
} catch (error) {
  if (error instanceof ProcessError) {
    logger.error(`Command failed: ${error.message}`);
    logger.debug(`Exit code: ${error.exitCode}`);
    logger.debug(`stderr: ${error.stderr}`);
  }
  throw BuildError.compilationFailed('TypeScript', { error });
}
```

### 2. Logging System
```javascript
const task = logger.taskStart('Build');
try {
  await performBuild();
  logger.taskEnd(task, true);
} catch (error) {
  logger.taskEnd(task, false, error);
  throw error;
}
```

### 3. Validation
```javascript
const port = validatePort(options.port); // Throws if invalid
validateFileExists('./build/index.html'); // Throws if missing
validateEnum(mode, ['development', 'production']); // Throws if invalid
```

### 4. File Operations
```javascript
// Safe file operations with automatic error handling
writeFile('./dist-ts/package.json', JSON.stringify({ type: 'module' }));
copy('./src/preload.js', './dist-ts/preload.js');
const files = findByExtension('./dist-ts', '.js');
```

## Usage Examples

### Using the Unified CLI
```bash
# Show help
node scripts/cli.mjs help

# Development
node scripts/cli.mjs dev                      # Start Electron dev
node scripts/cli.mjs dev:web --port=4000      # Web dev on port 4000

# Building
node scripts/cli.mjs build                    # Build Electron app
node scripts/cli.mjs build --mode=development # Build in dev mode
node scripts/cli.mjs build --package          # Build and package
node scripts/cli.mjs dist                     # Build for distribution

# Running
node scripts/cli.mjs start                    # Run built app
```

### Using npm Scripts
```bash
npm run dev              # Start Electron dev
npm run dev:web          # Start web dev
npm run build            # Build Electron app
npm run build:frontend   # Build frontend only
npm run dist             # Build and package
npm run start            # Run built app
npm run cli -- --help    # Show CLI help
```

### Using Individual Commands
```javascript
// Direct import for programmatic usage
import { startDevElectron } from './scripts/commands/dev.mjs';
import { build } from './scripts/commands/build.mjs';

// Start development
try {
  await startDevElectron({ port: 4000 });
} catch (error) {
  console.error('Dev failed:', error.message);
}

// Build application
const result = await build({
  mode: 'production',
  package: true,
  clean: true
});

if (result.success) {
  console.log(`Build completed in ${result.duration}ms`);
}
```

## Migration Notes

### From Old Structure
1. **main.mjs** → **cli.mjs** (new unified entry point)
2. **dev.mjs** → **commands/dev.mjs** (modularized)
3. **build.mjs** → **commands/build.mjs** (modularized)
4. **start.mjs** → **commands/start.mjs** (modularized)
5. **utils.mjs** → Split into **utils/fs.mjs**, **utils/exec.mjs**, **utils/network.mjs**, **utils/validate.mjs**
6. **logger.mjs** → **core/logger.mjs** (enhanced)
7. **error-handler.mjs** → **core/errors.mjs** (expanded)

### What's New
1. **core/config.mjs** - Centralized configuration
2. **core/errors.mjs** - Comprehensive error classes
3. **utils/validate.mjs** - Input validation utilities
4. **Process Manager** - Better process lifecycle handling
5. **Task Tracking** - Built-in task timing and status
6. **Graceful Shutdown** - Proper cleanup on SIGINT/SIGTERM

### Backwards Compatibility
- npm scripts remain unchanged
- All commands work the same way
- Environment variables still supported
- Exit codes preserved (0=success, 1+=error)

## Testing

All scripts pass Node.js syntax check:
```bash
node --check scripts/cli.mjs
node --check scripts/core/*.mjs
node --check scripts/utils/*.mjs
node --check scripts/commands/*.mjs
```

CLI functionality test:
```bash
node scripts/cli.mjs help
node scripts/cli.mjs version
```

Linting (optional):
```bash
npm run lint
```
