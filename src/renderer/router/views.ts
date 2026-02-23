/**
 * View Registry
 * Centralized registration of all views for WinBox routing
 */

import { getRouter, type ViewConfig } from '../router';
import ElectronIntro from '../use-cases/ElectronIntro.vue';
import ElectronArchitecture from '../use-cases/ElectronArchitecture.vue';
import ElectronSecurity from '../use-cases/ElectronSecurity.vue';
import ElectronPackaging from '../use-cases/ElectronPackaging.vue';
import ElectronNativeAPIs from '../use-cases/ElectronNativeAPIs.vue';
import ElectronPerformance from '../use-cases/ElectronPerformance.vue';
import ElectronDevelopment from '../use-cases/ElectronDevelopment.vue';
import ElectronVersions from '../use-cases/ElectronVersions.vue';

/**
 * Predefined view configurations
 */
export const views: ViewConfig[] = [
  {
    name: 'electron-intro',
    title: 'Electron Introduction',
    component: ElectronIntro,
    windowOptions: {
      width: 600,
      height: 450,
      background: '#1a1a2e',
    },
    onEnter: (params) => {
      console.log('Electron Intro opened', params);
    },
  },
  {
    name: 'electron-architecture',
    title: 'Electron Architecture',
    component: ElectronArchitecture,
    windowOptions: {
      width: 650,
      height: 500,
      background: '#16213e',
    },
  },
  {
    name: 'electron-security',
    title: 'Electron Security',
    component: ElectronSecurity,
    windowOptions: {
      width: 600,
      height: 450,
      background: '#0f3460',
    },
  },
  {
    name: 'electron-packaging',
    title: 'Electron Packaging',
    component: ElectronPackaging,
    windowOptions: {
      width: 650,
      height: 500,
      background: '#1a1a2e',
    },
  },
  {
    name: 'electron-native-apis',
    title: 'Electron Native APIs',
    component: ElectronNativeAPIs,
    windowOptions: {
      width: 700,
      height: 550,
      background: '#16213e',
    },
  },
  {
    name: 'electron-performance',
    title: 'Electron Performance',
    component: ElectronPerformance,
    windowOptions: {
      width: 600,
      height: 450,
      background: '#0f3460',
    },
  },
  {
    name: 'electron-development',
    title: 'Electron Development',
    component: ElectronDevelopment,
    windowOptions: {
      width: 650,
      height: 500,
      background: '#1a1a2e',
    },
  },
  {
    name: 'electron-versions',
    title: 'Electron Versions',
    component: ElectronVersions,
    windowOptions: {
      width: 500,
      height: 400,
      background: '#16213e',
    },
  },
];

/**
 * Initialize the router with all registered views
 */
export function initializeRouter(): void {
  const router = getRouter({
    debug: false,
    maxWindows: 10,
    stackWindows: false,
    defaultWindowOptions: {
      min: false,
      max: false,
    },
  });

  router.registerViews(views);
  
  console.log('[ViewRegistry] Router initialized with', views.length, 'views');
}

/**
 * Get a view configuration by name
 */
export function getView(name: string): ViewConfig | undefined {
  return views.find(v => v.name === name);
}

/**
 * Get all registered views
 */
export function getAllViews(): ViewConfig[] {
  return [...views];
}

/**
 * Add a new view dynamically
 */
export function addView(view: ViewConfig): void {
  if (!views.find(v => v.name === view.name)) {
    views.push(view);
    const router = getRouter();
    router.registerView(view);
    console.log('[ViewRegistry] View added:', view.name);
  }
}
