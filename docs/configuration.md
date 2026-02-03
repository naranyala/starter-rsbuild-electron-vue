# Advanced Configuration and Customization

## Rsbuild Configuration
The project uses Rsbuild for fast and optimized builds. The configuration file `rsbuild.config.ts` includes:

- Vue 3 plugin with HMR support
- Type checking integration
- Custom HTML template
- Asset copying and optimization
- Development server configuration
- Performance optimizations with smart chunk splitting

### Extending Rsbuild Configuration
You can extend the configuration by modifying `rsbuild.config.ts`:

```typescript
import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';

export default defineConfig({
  plugins: [
    pluginVue(),
    pluginTypeCheck({
      enable: true,
    }),
    // Add additional plugins here
  ],
  // Add custom configuration
  source: {
    alias: {
      // Define path aliases
      '@': './src',
    },
  },
  tools: {
    // Extend webpack/rspack configuration
  },
});
```

## Electron Configuration
The Electron app is configured through `package.json` with electron-builder settings:

- Cross-platform targets (AppImage, MSI, DMG)
- Custom installer configurations
- Application metadata and icons
- Extra resources and files inclusion
- Platform-specific settings

## Environment-Specific Configurations
- Development: Uses `src/main-dev.ts` with full preload API
- Production: Uses `src/main.ts` with security-focused configuration
- Different ports and settings for various environments
- Conditional feature flags and configurations

## Custom IPC Handlers
Extend the IPC system by adding new handlers in:
- `src/main/handlers/` for use-case specific handlers
- `src/main/services/` for reusable business logic
- `src/preload.ts` to expose new APIs to the renderer

## Window Management
Advanced window configurations include:
- Custom window options and properties
- Multiple window management
- Window lifecycle hooks
- Custom window behaviors and interactions

## Security Configuration
- Context isolation enabled by default
- Content Security Policy (CSP) implementation
- Secure IPC communication patterns
- Input validation and sanitization
- File system access controls

## Performance Tuning
- Renderer process optimization
- Memory management strategies
- Background process handling
- Resource loading optimization
- Caching strategies