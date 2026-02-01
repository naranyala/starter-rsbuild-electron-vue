export declare const IPC_CHANNELS: {
    readonly FILE: {
        readonly READ: "fs:readFile";
        readonly WRITE: "fs:writeFile";
        readonly EXISTS: "fs:exists";
        readonly MKDIR: "fs:mkdir";
        readonly READDIR: "fs:readdir";
        readonly DELETE_FILE: "fs:deleteFile";
    };
    readonly DIALOG: {
        readonly OPEN: "dialog:showOpenDialog";
        readonly SAVE: "dialog:showSaveDialog";
        readonly MESSAGE: "dialog:showMessageDialog";
    };
    readonly WINDOW: {
        readonly MINIMIZE: "window:minimize";
        readonly MAXIMIZE: "window:maximize";
        readonly CLOSE: "window:close";
        readonly FOCUS: "window:focus";
        readonly CENTER: "window:center";
        readonly GET_BOUNDS: "window:getBounds";
        readonly SET_BOUNDS: "window:setBounds";
    };
    readonly APP: {
        readonly GET_VERSION: "app:getVersion";
        readonly GET_NAME: "app:getName";
        readonly GET_PATH: "app:getPath";
        readonly QUIT: "app:quit";
        readonly FOCUS: "app:focus";
        readonly SET_BADGE_COUNT: "app:setBadgeCount";
        readonly GET_INFO: "app:getInfo";
        readonly SET_USER_MODEL_ID: "app:setUserModelID";
    };
    readonly SYSTEM: {
        readonly GET_PLATFORM: "system:getPlatform";
        readonly GET_ARCH: "system:getArch";
        readonly GET_INFO: "system:getInfo";
        readonly SHOW_IN_FOLDER: "system:showInFolder";
        readonly OPEN_EXTERNAL: "system:openExternal";
    };
    readonly PROCESS: {
        readonly EXEC_COMMAND: "process:execCommand";
        readonly SPAWN_PROCESS: "process:spawnProcess";
        readonly KILL_PROCESS: "process:killProcess";
    };
    readonly CLIPBOARD: {
        readonly READ_TEXT: "clipboard:readText";
        readonly WRITE_TEXT: "clipboard:writeText";
        readonly READ_IMAGE: "clipboard:readImage";
        readonly WRITE_IMAGE: "clipboard:writeImage";
    };
    readonly NOTIFICATION: {
        readonly SHOW: "notification:show";
        readonly REQUEST_PERMISSION: "notification:requestPermission";
    };
    readonly MENU: {
        readonly SHOW_CONTEXT: "menu:showContextMenu";
        readonly SET_APPLICATION: "menu:setApplicationMenu";
    };
    readonly SHELL: {
        readonly OPEN_EXTERNAL: "shell:openExternal";
        readonly OPEN_PATH: "shell:openPath";
        readonly SHOW_ITEM_IN_FOLDER: "shell:showItemInFolder";
    };
    readonly USE_CASE: {
        readonly ELECTRON_INTRO: "use-case:electron-intro";
        readonly ELECTRON_ARCHITECTURE: "use-case:electron-architecture";
        readonly ELECTRON_SECURITY: "use-case:electron-security";
        readonly ELECTRON_PACKAGING: "use-case:electron-packaging";
        readonly ELECTRON_NATIVE_APIS: "use-case:electron-native-apis";
        readonly ELECTRON_PERFORMANCE: "use-case:electron-performance";
        readonly ELECTRON_DEVELOPMENT: "use-case:electron-development";
        readonly ELECTRON_VERSIONS: "use-case:electron-versions";
    };
    readonly GENERAL: {
        readonly PING: "ping";
    };
};
export type IpcChannel = typeof IPC_CHANNELS;
//# sourceMappingURL=ipc-channels.d.ts.map