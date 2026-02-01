export interface UseCaseContract {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
}
export interface ReadFileContract {
    filePath: string;
}
export interface WriteFileContract {
    filePath: string;
    content: string;
}
export interface ExistsContract {
    filePath: string;
}
export interface MkdirContract {
    dirPath: string;
}
export interface ReaddirContract {
    dirPath: string;
}
export interface DeleteFileContract {
    filePath: string;
}
export interface SetBoundsContract {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface SystemInfoContract {
    platform: string;
    arch: string;
    release: string;
    hostname: string;
    cpus: any[];
    totalMemory: number;
    freeMemory: number;
    homeDir: string;
    tempDir: string;
}
export interface ExecCommandContract {
    command: string;
    options?: Record<string, any>;
}
export interface SpawnProcessContract {
    command: string;
    args: string[];
    options?: Record<string, any>;
}
export interface KillProcessContract {
    pid: number;
}
export interface Result<T> {
    success: boolean;
    data?: T;
    error?: string;
}
//# sourceMappingURL=api-contracts.d.ts.map