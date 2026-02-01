// Renderer process electron API service
import type { ElectronAPI } from '@/shared/types/electron-api';

export class ElectronApiService {
  static get api(): ElectronAPI {
    return (window as any).electronAPI;
  }

  static get nodeEnv() {
    return (window as any).nodeEnv;
  }

  // Convenience methods
  static async getVersion(): Promise<string> {
    return ElectronApiService.api.app.getVersion();
  }

  static async getPlatform(): Promise<string> {
    return ElectronApiService.api.system.getPlatform();
  }

  static async readTextFromClipboard(): Promise<string> {
    return ElectronApiService.api.clipboard.readText();
  }

  static async writeTextToClipboard(text: string): Promise<void> {
    return ElectronApiService.api.clipboard.writeText(text);
  }

  static async showContextMenu(
    template: Electron.MenuItemConstructorOptions[]
  ): Promise<void> {
    return ElectronApiService.api.menu.showContextMenu(template);
  }
}
