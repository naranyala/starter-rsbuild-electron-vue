import { deleteEnvVar, executeCommand as executeCommandUtil, executeFile as executeFileUtil, exitProcess, getAllEnvVars, getCpuUsage, getCurrentProcessInfo, getEnvVar, getMemoryUsage, getUptime, gracefulShutdown, isProcessRunning, killProcess, sendSignal, setEnvVar, spawnProcess as spawnProcessUtil } from './process-utils';
export declare class ProcessService {
    static executeCommand: typeof executeCommandUtil;
    static executeFile: typeof executeFileUtil;
    static spawn: typeof spawnProcessUtil;
    static kill: typeof killProcess;
    static isRunning: typeof isProcessRunning;
    static getInfo: typeof getCurrentProcessInfo;
    static getMemoryUsage: typeof getMemoryUsage;
    static getCpuUsage: typeof getCpuUsage;
    static getUptime: typeof getUptime;
    static setEnv: typeof setEnvVar;
    static getEnv: typeof getEnvVar;
    static deleteEnv: typeof deleteEnvVar;
    static getAllEnv: typeof getAllEnvVars;
    static exit: typeof exitProcess;
    static signal: typeof sendSignal;
    static shutdown: typeof gracefulShutdown;
}
//# sourceMappingURL=process-service.d.ts.map