export class ElectronApiService {
    static get api() {
        return window.electronAPI;
    }
    static get nodeEnv() {
        return window.nodeEnv;
    }
    // Convenience methods
    static async getVersion() {
        return ElectronApiService.api.app.getVersion();
    }
    static async getPlatform() {
        return ElectronApiService.api.system.getPlatform();
    }
    static async readTextFromClipboard() {
        return ElectronApiService.api.clipboard.readText();
    }
    static async writeTextToClipboard(text) {
        return ElectronApiService.api.clipboard.writeText(text);
    }
    static async showContextMenu(template) {
        return ElectronApiService.api.menu.showContextMenu(template);
    }
}
//# sourceMappingURL=electron-api.js.map