import type { ElectronAPI } from '@/shared/types/electron-api';
export declare class ElectronApiService {
    static get api(): ElectronAPI;
    static get nodeEnv(): any;
    static getVersion(): Promise<string>;
    static getPlatform(): Promise<string>;
    static readTextFromClipboard(): Promise<string>;
    static writeTextToClipboard(text: string): Promise<void>;
    static showContextMenu(template: Electron.MenuItemConstructorOptions[]): Promise<void>;
}
//# sourceMappingURL=electron-api.d.ts.map