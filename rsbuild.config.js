import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';

export default defineConfig({
  plugins: [
    pluginVue(),
    pluginTypeCheck({
      // Enable type checking
      enable: true,
    }),
  ],
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
    port: 3000, // Default port, will be overridden in dev server
    strictPort: false, // Allow using alternative port if 3000 is occupied
    printUrls: true,
  },
  source: {
    entry: {
      index: './src/renderer/main.js',
    },
  },
  performance: {
    chunkSplit: {
      strategy: 'split-by-experience',
    },
  },
});
