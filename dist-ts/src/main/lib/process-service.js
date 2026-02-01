// Main process process service
import { deleteEnvVar, executeCommand as executeCommandUtil, executeFile as executeFileUtil, exitProcess, getAllEnvVars, getCpuUsage, getCurrentProcessInfo, getEnvVar, getMemoryUsage, getUptime, gracefulShutdown, isProcessRunning, killProcess, sendSignal, setEnvVar, spawnProcess as spawnProcessUtil, } from './process-utils.js';
export class ProcessService {
}
ProcessService.executeCommand = executeCommandUtil;
ProcessService.executeFile = executeFileUtil;
ProcessService.spawn = spawnProcessUtil;
ProcessService.kill = killProcess;
ProcessService.isRunning = isProcessRunning;
ProcessService.getInfo = getCurrentProcessInfo;
ProcessService.getMemoryUsage = getMemoryUsage;
ProcessService.getCpuUsage = getCpuUsage;
ProcessService.getUptime = getUptime;
ProcessService.setEnv = setEnvVar;
ProcessService.getEnv = getEnvVar;
ProcessService.deleteEnv = deleteEnvVar;
ProcessService.getAllEnv = getAllEnvVars;
ProcessService.exit = exitProcess;
ProcessService.signal = sendSignal;
ProcessService.shutdown = gracefulShutdown;
//# sourceMappingURL=process-service.js.map