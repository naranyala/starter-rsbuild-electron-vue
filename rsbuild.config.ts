import { defineConfig } from '@rsbuild/core';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';
import { pluginVue } from '@rsbuild/plugin-vue';

export default defineConfig({
  plugins: [
    pluginVue(),
    pluginTypeCheck({
      enable: true,
    }),
  ],
  source: {
    entry: {
      index: './src/renderer/main.ts',
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
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
      root: './build',
    },
    cleanDistPath: true,
    copy: [{ from: './src/renderer/assets', to: 'assets/' }],
  },
  server: {
    port: 3000,
    strictPort: false,
    printUrls: true,
  },
  dev: {
    hmr: true,
    liveReload: true,
    writeToDisk: false,
  },
  performance: {
    chunkSplit: {
      strategy: 'split-by-experience',
    },
  },
  tools: {
    bundlerChain: chain => {
      chain.target('electron-renderer');
    },
    rspack: rspack => {
      rspack.output ||= {};
      rspack.output.globalObject = 'window';
    },
  },
});
