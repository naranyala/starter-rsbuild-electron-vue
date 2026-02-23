// Export all view components
export { default as ElectronArchitecture } from './ElectronArchitecture.vue';
export { default as ElectronDevelopment } from './ElectronDevelopment.vue';
export { default as ElectronIntro } from './ElectronIntro.vue';
export { default as ElectronNativeAPIs } from './ElectronNativeAPIs.vue';
export { default as ElectronPackaging } from './ElectronPackaging.vue';
export { default as ElectronPerformance } from './ElectronPerformance.vue';
export { default as ElectronSecurity } from './ElectronSecurity.vue';
export { default as ElectronVersions } from './ElectronVersions.vue';

// Define types for view components
export type ViewComponentName =
  | 'ElectronArchitecture'
  | 'ElectronDevelopment'
  | 'ElectronIntro'
  | 'ElectronNativeAPIs'
  | 'ElectronPackaging'
  | 'ElectronPerformance'
  | 'ElectronSecurity'
  | 'ElectronVersions';

export type ViewId =
  | 'electron-architecture'
  | 'electron-development'
  | 'electron-intro'
  | 'electron-native-apis'
  | 'electron-packaging'
  | 'electron-performance'
  | 'electron-security'
  | 'electron-versions';

// Map of view IDs to components
export const viewComponents: Record<ViewId, ViewComponentName> = {
  'electron-architecture': 'ElectronArchitecture',
  'electron-development': 'ElectronDevelopment',
  'electron-intro': 'ElectronIntro',
  'electron-native-apis': 'ElectronNativeAPIs',
  'electron-packaging': 'ElectronPackaging',
  'electron-performance': 'ElectronPerformance',
  'electron-security': 'ElectronSecurity',
  'electron-versions': 'ElectronVersions',
};

// Map of view IDs to component objects (for lazy loading)
export const viewComponentObjects: Record<ViewId, () => Promise<any>> = {
  'electron-architecture': () => import('./ElectronArchitecture.vue'),
  'electron-development': () => import('./ElectronDevelopment.vue'),
  'electron-intro': () => import('./ElectronIntro.vue'),
  'electron-native-apis': () => import('./ElectronNativeAPIs.vue'),
  'electron-packaging': () => import('./ElectronPackaging.vue'),
  'electron-performance': () => import('./ElectronPerformance.vue'),
  'electron-security': () => import('./ElectronSecurity.vue'),
  'electron-versions': () => import('./ElectronVersions.vue'),
};
