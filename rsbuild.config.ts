import { defineConfig } from '@rsbuild/core';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';
import { pluginVue } from '@rsbuild/plugin-vue';

export default defineConfig({
  plugins: [
    pluginVue(),
    pluginTypeCheck({
      // Enable type checking
      enable: true,
    }),
  ],
  source: {
    entry: {
      index: './src/renderer/main.js',
    },
  },
  html: {
    template: './src/renderer/index.html',
    meta: {
      'theme-color': '#000000',
    },
  },
  output: {
    distPath: {
      root: './build', // Output to build directory for electron-builder compatibility
    },
    cleanDistPath: true, // Clean build directory before each build
    copy: [{ from: './src/renderer/assets', to: 'assets/' }],
  },
  server: {
    port: 3000, // Default port, can be overridden with --port flag
    strictPort: false, // Allow using alternative port if default is occupied
    printUrls: true,
  },
  dev: {
    // Configure HMR settings to avoid KIO issues
    client: {
      host: 'localhost',
      protocol: 'ws',
    },
    hmr: true,
    liveReload: true,
    writeToDisk: false,
  },
  performance: {
    chunkSplit: {
      strategy: 'split-by-experience',
    },
  },
});
