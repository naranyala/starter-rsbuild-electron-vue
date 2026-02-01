export declare const APP_CONSTANTS: {
    readonly DEFAULT_WINDOW_WIDTH: 1200;
    readonly DEFAULT_WINDOW_HEIGHT: 800;
    readonly MIN_WINDOW_WIDTH: 800;
    readonly MIN_WINDOW_HEIGHT: 600;
    readonly DEVELOPMENT_PORT: 3000;
    readonly CSP_NONCE_LENGTH: 16;
};
export declare const SECURITY_CONSTANTS: {
    readonly BLOCKED_PROTOCOLS: readonly ["data:", "javascript:", "vbscript:"];
    readonly DENIED_PERMISSIONS: readonly ["media", "geolocation", "notifications", "midi", "midiSysex", "pointerLock", "fullscreen", "openExternal", "videoCapture", "audioCapture", "displayCapture", "desktopCapture"];
};
export declare const FILE_CONSTANTS: {
    readonly DEFAULT_ENCODING: "utf8";
    readonly MAX_BUFFER_SIZE: number;
    readonly DEFAULT_TIMEOUT: 30000;
};
export type AppConstants = typeof APP_CONSTANTS;
export type SecurityConstants = typeof SECURITY_CONSTANTS;
export type FileConstants = typeof FILE_CONSTANTS;
//# sourceMappingURL=constants.d.ts.map