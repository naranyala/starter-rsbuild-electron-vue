import * as fs from 'fs';
import * as path from 'path';

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function readFile(filePath: string): string {
  if (!fileExists(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

export function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

export function createDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function deleteFile(filePath: string): boolean {
  if (fileExists(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

export function readDirectory(dirPath: string): string[] {
  if (!fileExists(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    return [];
  }
  return fs.readdirSync(dirPath);
}

export function getFileInfo(filePath: string): fs.Stats | null {
  if (!fileExists(filePath)) {
    return null;
  }
  return fs.statSync(filePath);
}

export function copyPath(src: string, dest: string): void {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDirectory(src, dest);
  } else {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

export function copyDirectory(src: string, dest: string): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const items = fs.readdirSync(src);
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export function deletePath(filePath: string): boolean {
  if (!fileExists(filePath)) {
    return false;
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    fs.rmSync(filePath, { recursive: true, force: true });
  } else {
    fs.unlinkSync(filePath);
  }

  return true;
}

export function getFileModifiedTime(filePath: string): Date | null {
  if (!fileExists(filePath)) {
    return null;
  }
  const stats = fs.statSync(filePath);
  return stats.mtime;
}

export function getFileSize(filePath: string): number | null {
  if (!fileExists(filePath)) {
    return null;
  }
  const stats = fs.statSync(filePath);
  return stats.size;
}

export function getHomeDir(): string {
  return require('os').homedir();
}

export function getTempDir(): string {
  return require('os').tmpdir();
}

export function isDirectory(filePath: string): boolean {
  if (!fileExists(filePath)) {
    return false;
  }
  const stats = fs.statSync(filePath);
  return stats.isDirectory();
}

export function isFile(filePath: string): boolean {
  if (!fileExists(filePath)) {
    return false;
  }
  const stats = fs.statSync(filePath);
  return stats.isFile();
}

export function listFiles(dirPath: string): string[] {
  if (!fileExists(dirPath) || !isDirectory(dirPath)) {
    return [];
  }
  return fs.readdirSync(dirPath);
}

export function readJsonFile(filePath: string): any {
  const content = readFile(filePath);
  return JSON.parse(content);
}

export function writeJsonFile(filePath: string, data: any): void {
  const jsonString = JSON.stringify(data, null, 2);
  writeFile(filePath, jsonString);
}

export function getSystemInfo(): {
  platform: NodeJS.Platform;
  arch: string;
  release: string;
  hostname: string;
  cpus: {
    model: string;
    speed: number;
    times: {
      user: number;
      nice: number;
      sys: number;
      idle: number;
      irq: number;
    };
  }[];
  totalMemory: number;
  freeMemory: number;
  uptime: number;
} {
  const os = require('os');
  return {
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    hostname: os.hostname(),
    cpus: os.cpus().map((cpu: any) => ({
      model: cpu.model,
      speed: cpu.speed,
      times: {
        user: cpu.times.user,
        nice: cpu.times.nice,
        sys: cpu.times.sys,
        idle: cpu.times.idle,
        irq: cpu.times.irq,
      }
    })),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptime: os.uptime(),
  };
}