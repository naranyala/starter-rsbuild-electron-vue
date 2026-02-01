// Main process process service
import {
  deleteEnvVar,
  executeCommand as executeCommandUtil,
  executeFile as executeFileUtil,
  exitProcess,
  getAllEnvVars,
  getCpuUsage,
  getCurrentProcessInfo,
  getEnvVar,
  getMemoryUsage,
  getUptime,
  gracefulShutdown,
  isProcessRunning,
  killProcess,
  sendSignal,
  setEnvVar,
  spawnProcess as spawnProcessUtil,
} from './process-utils';

export class ProcessService {
  static executeCommand = executeCommandUtil;
  static executeFile = executeFileUtil;
  static spawn = spawnProcessUtil;
  static kill = killProcess;
  static isRunning = isProcessRunning;
  static getInfo = getCurrentProcessInfo;
  static getMemoryUsage = getMemoryUsage;
  static getCpuUsage = getCpuUsage;
  static getUptime = getUptime;
  static setEnv = setEnvVar;
  static getEnv = getEnvVar;
  static deleteEnv = deleteEnvVar;
  static getAllEnv = getAllEnvVars;
  static exit = exitProcess;
  static signal = sendSignal;
  static shutdown = gracefulShutdown;
}
