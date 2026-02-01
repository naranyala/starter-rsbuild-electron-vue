export { default as ElectronArchitecture } from './ElectronArchitecture.vue';
export { default as ElectronDevelopment } from './ElectronDevelopment.vue';
export { default as ElectronIntro } from './ElectronIntro.vue';
export { default as ElectronNativeAPIs } from './ElectronNativeAPIs.vue';
export { default as ElectronPackaging } from './ElectronPackaging.vue';
export { default as ElectronPerformance } from './ElectronPerformance.vue';
export { default as ElectronSecurity } from './ElectronSecurity.vue';
export { default as ElectronVersions } from './ElectronVersions.vue';
export type UseCaseComponentName = 'ElectronArchitecture' | 'ElectronDevelopment' | 'ElectronIntro' | 'ElectronNativeAPIs' | 'ElectronPackaging' | 'ElectronPerformance' | 'ElectronSecurity' | 'ElectronVersions';
export type UseCaseId = 'electron-architecture' | 'electron-development' | 'electron-intro' | 'electron-native-apis' | 'electron-packaging' | 'electron-performance' | 'electron-security' | 'electron-versions';
export declare const useCaseComponents: Record<UseCaseId, UseCaseComponentName>;
export declare const useCaseComponentObjects: Record<UseCaseId, () => Promise<any>>;
//# sourceMappingURL=index.d.ts.map