// Main process file service
import * as fs from 'fs';
import * as path from 'path';
import {
  copyDirectory,
  copyPath,
  createDirectory,
  deletePath,
  fileExists,
  getFileModifiedTime,
  getFileSize,
  getHomeDir,
  getSystemInfo,
  getTempDir,
  isDirectory,
  isFile,
  listFiles,
  readFile,
  readJsonFile,
  writeFile,
  writeJsonFile,
} from '../lib/filesystem-utils';

export class FileService {
  static exists = fileExists;
  static isFile = isFile;
  static isDirectory = isDirectory;
  static read = readFile;
  static write = writeFile;
  static createDirectory = createDirectory;
  static delete = deletePath;
  static list = listFiles;
  static readJson = readJsonFile;
  static writeJson = writeJsonFile;
  static getSize = getFileSize;
  static getModifiedTime = getFileModifiedTime;
  static copy = copyPath;
  static copyDir = copyDirectory;
  static getHomeDir = getHomeDir;
  static getTempDir = getTempDir;
  static getSystemInfo = getSystemInfo;
}
