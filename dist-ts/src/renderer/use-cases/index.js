// Export all use case components
export { default as ElectronArchitecture } from './ElectronArchitecture.vue.js';
export { default as ElectronDevelopment } from './ElectronDevelopment.vue.js';
export { default as ElectronIntro } from './ElectronIntro.vue.js';
export { default as ElectronNativeAPIs } from './ElectronNativeAPIs.vue.js';
export { default as ElectronPackaging } from './ElectronPackaging.vue.js';
export { default as ElectronPerformance } from './ElectronPerformance.vue.js';
export { default as ElectronSecurity } from './ElectronSecurity.vue.js';
export { default as ElectronVersions } from './ElectronVersions.vue.js';
// Map of use case IDs to components
export const useCaseComponents = {
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
export const useCaseComponentObjects = {
    'electron-architecture': () => import('./ElectronArchitecture.vue'),
    'electron-development': () => import('./ElectronDevelopment.vue'),
    'electron-intro': () => import('./ElectronIntro.vue'),
    'electron-native-apis': () => import('./ElectronNativeAPIs.vue'),
    'electron-packaging': () => import('./ElectronPackaging.vue'),
    'electron-performance': () => import('./ElectronPerformance.vue'),
    'electron-security': () => import('./ElectronSecurity.vue'),
    'electron-versions': () => import('./ElectronVersions.vue'),
};
//# sourceMappingURL=index.js.map