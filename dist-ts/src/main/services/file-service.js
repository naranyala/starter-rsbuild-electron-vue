import { copyDirectory, copyPath, createDirectory, deletePath, fileExists, getFileModifiedTime, getFileSize, getHomeDir, getSystemInfo, getTempDir, isDirectory, isFile, listFiles, readFile, readJsonFile, writeFile, writeJsonFile, } from '../lib/filesystem-utils.js';
export class FileService {
}
FileService.exists = fileExists;
FileService.isFile = isFile;
FileService.isDirectory = isDirectory;
FileService.read = readFile;
FileService.write = writeFile;
FileService.createDirectory = createDirectory;
FileService.delete = deletePath;
FileService.list = listFiles;
FileService.readJson = readJsonFile;
FileService.writeJson = writeJsonFile;
FileService.getSize = getFileSize;
FileService.getModifiedTime = getFileModifiedTime;
FileService.copy = copyPath;
FileService.copyDir = copyDirectory;
FileService.getHomeDir = getHomeDir;
FileService.getTempDir = getTempDir;
FileService.getSystemInfo = getSystemInfo;
//# sourceMappingURL=file-service.js.map