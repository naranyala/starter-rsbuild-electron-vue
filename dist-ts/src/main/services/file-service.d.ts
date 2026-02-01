import { copyDirectory, copyPath, createDirectory, deletePath, fileExists, getFileModifiedTime, getFileSize, getHomeDir, getSystemInfo, getTempDir, isDirectory, isFile, listFiles, readFile, readJsonFile, writeFile, writeJsonFile } from '../lib/filesystem-utils';
export declare class FileService {
    static exists: typeof fileExists;
    static isFile: typeof isFile;
    static isDirectory: typeof isDirectory;
    static read: typeof readFile;
    static write: typeof writeFile;
    static createDirectory: typeof createDirectory;
    static delete: typeof deletePath;
    static list: typeof listFiles;
    static readJson: typeof readJsonFile;
    static writeJson: typeof writeJsonFile;
    static getSize: typeof getFileSize;
    static getModifiedTime: typeof getFileModifiedTime;
    static copy: typeof copyPath;
    static copyDir: typeof copyDirectory;
    static getHomeDir: typeof getHomeDir;
    static getTempDir: typeof getTempDir;
    static getSystemInfo: typeof getSystemInfo;
}
//# sourceMappingURL=file-service.d.ts.map