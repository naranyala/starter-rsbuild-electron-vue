import type * as os from 'os';
export interface UseCase {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
}
export interface WindowConfig {
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    x?: number;
    y?: number;
    webPreferences: Electron.WebPreferences;
    frame: boolean;
    show: boolean;
    autoHideMenuBar: boolean;
    icon?: string;
}
export interface SystemInfo {
    platform: NodeJS.Platform;
    arch: string;
    release: string;
    hostname: string;
    cpus: os.CpuInfo[];
    totalMemory: number;
    freeMemory: number;
    homeDir: string;
    tempDir: string;
}
export interface ProcessInfo {
    pid: number;
    ppid: number;
    title: string;
    version: string;
    versions: NodeJS.ProcessVersions;
    platform: NodeJS.Platform;
    arch: string;
    env: typeof process.env;
    argv: string[];
    execPath: string;
    execArgv: string[];
    cwd: string;
}
export interface MemoryUsage {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
    totalSystem: number;
    freeSystem: number;
    usedSystem: number;
}
//# sourceMappingURL=entities.d.ts.map