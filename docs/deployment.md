# Deployment and Distribution

## Building for Production
The starter provides multiple build commands for different scenarios:

### Full Production Build
```bash
bun run build
```
This command:
- Compiles TypeScript to `dist-ts/`
- Builds the renderer with Rsbuild to `build/`
- Copies preload output to `dist-ts/`

### Frontend-Only Build
```bash
bun run build:frontend
```
Builds only the renderer portion using Rsbuild.

### TypeScript Compilation
```bash
bun run build:ts
```
Compiles TypeScript files to JavaScript in `dist-ts/`.

## Packaging for Distribution
Package your application for distribution using:

```bash
bun run dist
```

This command:
- Runs a full build
- Packages the application using electron-builder
- Creates platform-specific installers in `dist/`
- Supports Windows (MSI), macOS (DMG), and Linux (AppImage, DEB)

## Platform-Specific Targets
Electron Builder creates the following packages:
- **Windows**: MSI installer
- **macOS**: DMG disk image
- **Linux**: AppImage and DEB package

## Distribution Configuration
The packaging configuration is defined in `package.json` under the `build` property:
- Application ID for unique identification
- Platform-specific settings
- Target formats for each OS
- File inclusion/exclusion rules
- Extra resources and files

## Release Process
Recommended release workflow:
1. Update version in `package.json`
2. Run `bun run dist` to create installers
3. Test installers on target platforms
4. Sign applications for distribution (especially for macOS)
5. Publish to distribution platforms

## Continuous Integration
For CI/CD pipelines, consider:
- Automated building on tag pushes
- Cross-platform testing
- Code signing for production releases
- Automated publishing to distribution platforms

## Update Mechanisms
Consider implementing:
- Auto-update functionality
- Manual update notifications
- Delta updates for efficiency
- Rollback mechanisms for failed updates