// Export all use case components
export { default as ElectronArchitecture } from './ElectronArchitecture.vue';
export { default as ElectronDevelopment } from './ElectronDevelopment.vue';
export { default as ElectronIntro } from './ElectronIntro.vue';
export { default as ElectronNativeAPIs } from './ElectronNativeAPIs.vue';
export { default as ElectronPackaging } from './ElectronPackaging.vue';
export { default as ElectronPerformance } from './ElectronPerformance.vue';
export { default as ElectronSecurity } from './ElectronSecurity.vue';
export { default as ElectronVersions } from './ElectronVersions.vue';

// Define types for use case components
export type UseCaseComponentName =
  | 'ElectronArchitecture'
  | 'ElectronDevelopment'
  | 'ElectronIntro'
  | 'ElectronNativeAPIs'
  | 'ElectronPackaging'
  | 'ElectronPerformance'
  | 'ElectronSecurity'
  | 'ElectronVersions';

export type UseCaseId =
  | 'electron-architecture'
  | 'electron-development'
  | 'electron-intro'
  | 'electron-native-apis'
  | 'electron-packaging'
  | 'electron-performance'
  | 'electron-security'
  | 'electron-versions';

// Map of use case IDs to components
export const useCaseComponents: Record<UseCaseId, UseCaseComponentName> = {
  'electron-architecture': 'ElectronArchitecture',
  'electron-development': 'ElectronDevelopment',
  'electron-intro': 'ElectronIntro',
  'electron-native-apis': 'ElectronNativeAPIs',
  'electron-packaging': 'ElectronPackaging',
  'electron-performance': 'ElectronPerformance',
  'electron-security': 'ElectronSecurity',
  'electron-versions': 'ElectronVersions',
};

// Map of use case IDs to component objects
export const useCaseComponentObjects: Record<UseCaseId, () => Promise<any>> = {
  'electron-architecture': () => import('./ElectronArchitecture.vue'),
  'electron-development': () => import('./ElectronDevelopment.vue'),
  'electron-intro': () => import('./ElectronIntro.vue'),
  'electron-native-apis': () => import('./ElectronNativeAPIs.vue'),
  'electron-packaging': () => import('./ElectronPackaging.vue'),
  'electron-performance': () => import('./ElectronPerformance.vue'),
  'electron-security': () => import('./ElectronSecurity.vue'),
  'electron-versions': () => import('./ElectronVersions.vue'),
};
