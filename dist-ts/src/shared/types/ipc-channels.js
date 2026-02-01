// IPC Channel Definitions
export const IPC_CHANNELS = {
    // File system operations
    FILE: {
        READ: 'fs:readFile',
        WRITE: 'fs:writeFile',
        EXISTS: 'fs:exists',
        MKDIR: 'fs:mkdir',
        READDIR: 'fs:readdir',
        DELETE_FILE: 'fs:deleteFile',
    },
    // Dialog operations
    DIALOG: {
        OPEN: 'dialog:showOpenDialog',
        SAVE: 'dialog:showSaveDialog',
        MESSAGE: 'dialog:showMessageDialog',
    },
    // Window operations
    WINDOW: {
        MINIMIZE: 'window:minimize',
        MAXIMIZE: 'window:maximize',
        CLOSE: 'window:close',
        FOCUS: 'window:focus',
        CENTER: 'window:center',
        GET_BOUNDS: 'window:getBounds',
        SET_BOUNDS: 'window:setBounds',
    },
    // Application operations
    APP: {
        GET_VERSION: 'app:getVersion',
        GET_NAME: 'app:getName',
        GET_PATH: 'app:getPath',
        QUIT: 'app:quit',
        FOCUS: 'app:focus',
        SET_BADGE_COUNT: 'app:setBadgeCount',
        GET_INFO: 'app:getInfo',
        SET_USER_MODEL_ID: 'app:setUserModelID',
    },
    // System operations
    SYSTEM: {
        GET_PLATFORM: 'system:getPlatform',
        GET_ARCH: 'system:getArch',
        GET_INFO: 'system:getInfo',
        SHOW_IN_FOLDER: 'system:showInFolder',
        OPEN_EXTERNAL: 'system:openExternal',
    },
    // Process operations
    PROCESS: {
        EXEC_COMMAND: 'process:execCommand',
        SPAWN_PROCESS: 'process:spawnProcess',
        KILL_PROCESS: 'process:killProcess',
    },
    // Clipboard operations
    CLIPBOARD: {
        READ_TEXT: 'clipboard:readText',
        WRITE_TEXT: 'clipboard:writeText',
        READ_IMAGE: 'clipboard:readImage',
        WRITE_IMAGE: 'clipboard:writeImage',
    },
    // Notification operations
    NOTIFICATION: {
        SHOW: 'notification:show',
        REQUEST_PERMISSION: 'notification:requestPermission',
    },
    // Menu operations
    MENU: {
        SHOW_CONTEXT: 'menu:showContextMenu',
        SET_APPLICATION: 'menu:setApplicationMenu',
    },
    // Shell operations
    SHELL: {
        OPEN_EXTERNAL: 'shell:openExternal',
        OPEN_PATH: 'shell:openPath',
        SHOW_ITEM_IN_FOLDER: 'shell:showItemInFolder',
    },
    // Use case operations
    USE_CASE: {
        ELECTRON_INTRO: 'use-case:electron-intro',
        ELECTRON_ARCHITECTURE: 'use-case:electron-architecture',
        ELECTRON_SECURITY: 'use-case:electron-security',
        ELECTRON_PACKAGING: 'use-case:electron-packaging',
        ELECTRON_NATIVE_APIS: 'use-case:electron-native-apis',
        ELECTRON_PERFORMANCE: 'use-case:electron-performance',
        ELECTRON_DEVELOPMENT: 'use-case:electron-development',
        ELECTRON_VERSIONS: 'use-case:electron-versions',
    },
    // General operations
    GENERAL: {
        PING: 'ping',
    },
};
//# sourceMappingURL=ipc-channels.js.map