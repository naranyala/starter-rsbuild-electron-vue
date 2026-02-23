import * as fs from 'fs';
import * as path from 'path';
import { Err, Ok, type Result } from '../../shared/result';

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function safeFileExists(filePath: string): Result<boolean, Error> {
  try {
    return Ok(fs.existsSync(filePath));
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

export function readFile(filePath: string): string {
  if (!fileExists(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

export function safeReadFile(filePath: string): Result<string, Error> {
  try {
    if (!fs.existsSync(filePath)) {
      return Err(new Error(`File does not exist: ${filePath}`));
    }
    return Ok(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

export function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

export function safeWriteFile(
  filePath: string,
  content: string
): Result<void, Error> {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    return Ok(undefined);
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

export function createDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function safeCreateDirectory(dirPath: string): Result<void, Error> {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return Ok(undefined);
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

export function deleteFile(filePath: string): boolean {
  if (fileExists(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

export function safeDeleteFile(filePath: string): Result<boolean, Error> {
  try {
    if (fileExists(filePath)) {
      fs.unlinkSync(filePath);
      return Ok(true);
    }
    return Ok(false);
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

export function readDirectory(dirPath: string): string[] {
  if (!fileExists(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    return [];
  }
  return fs.readdirSync(dirPath);
}

export function safeReadDirectory(dirPath: string): Result<string[], Error> {
  try {
    if (!fileExists(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      return Ok([]);
    }
    return Ok(fs.readdirSync(dirPath));
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

export function getFileInfo(filePath: string): fs.Stats | null {
  if (!fileExists(filePath)) {
    return null;
  }
  return fs.statSync(filePath);
}

export function safeGetFileInfo(
  filePath: string
): Result<fs.Stats | null, Error> {
  try {
    if (!fileExists(filePath)) {
      return Ok(null);
    }
    return Ok(fs.statSync(filePath));
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
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

export function safeCopyPath(src: string, dest: string): Result<void, Error> {
  try {
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
    return Ok(undefined);
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
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

export function safeCopyDirectory(
  src: string,
  dest: string
): Result<void, Error> {
  try {
    copyDirectory(src, dest);
    return Ok(undefined);
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
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

export function safeDeletePath(filePath: string): Result<boolean, Error> {
  try {
    if (!fileExists(filePath)) {
      return Ok(false);
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(filePath);
    }

    return Ok(true);
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

export function getFileModifiedTime(filePath: string): Date | null {
  if (!fileExists(filePath)) {
    return null;
  }
  const stats = fs.statSync(filePath);
  return stats.mtime;
}

export function safeGetFileModifiedTime(
  filePath: string
): Result<Date | null, Error> {
  try {
    if (!fileExists(filePath)) {
      return Ok(null);
    }
    const stats = fs.statSync(filePath);
    return Ok(stats.mtime);
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

export function getFileSize(filePath: string): number | null {
  if (!fileExists(filePath)) {
    return null;
  }
  const stats = fs.statSync(filePath);
  return stats.size;
}

export function safeGetFileSize(
  filePath: string
): Result<number | null, Error> {
  try {
    if (!fileExists(filePath)) {
      return Ok(null);
    }
    const stats = fs.statSync(filePath);
    return Ok(stats.size);
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

export function getHomeDir(): string {
  return require('os').homedir();
}

export function safeGetHomeDir(): Result<string, Error> {
  return Ok(require('os').homedir());
}

export function getTempDir(): string {
  return require('os').tmpdir();
}

export function safeGetTempDir(): Result<string, Error> {
  return Ok(require('os').tmpdir());
}

export function isDirectory(filePath: string): boolean {
  if (!fileExists(filePath)) {
    return false;
  }
  const stats = fs.statSync(filePath);
  return stats.isDirectory();
}

export function safeIsDirectory(filePath: string): Result<boolean, Error> {
  try {
    if (!fileExists(filePath)) {
      return Ok(false);
    }
    const stats = fs.statSync(filePath);
    return Ok(stats.isDirectory());
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

export function isFile(filePath: string): boolean {
  if (!fileExists(filePath)) {
    return false;
  }
  const stats = fs.statSync(filePath);
  return stats.isFile();
}

export function safeIsFile(filePath: string): Result<boolean, Error> {
  try {
    if (!fileExists(filePath)) {
      return Ok(false);
    }
    const stats = fs.statSync(filePath);
    return Ok(stats.isFile());
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

export function listFiles(dirPath: string): string[] {
  if (!fileExists(dirPath) || !isDirectory(dirPath)) {
    return [];
  }
  return fs.readdirSync(dirPath);
}

export function safeListFiles(dirPath: string): Result<string[], Error> {
  try {
    if (!fileExists(dirPath) || !isDirectory(dirPath)) {
      return Ok([]);
    }
    return Ok(fs.readdirSync(dirPath));
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

export function readJsonFile(filePath: string): unknown {
  const content = readFile(filePath);
  return JSON.parse(content);
}

export function safeReadJsonFile(filePath: string): Result<unknown, Error> {
  try {
    const content = readFile(filePath);
    return Ok(JSON.parse(content));
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

export function writeJsonFile(filePath: string, data: unknown): void {
  const jsonString = JSON.stringify(data, null, 2);
  writeFile(filePath, jsonString);
}

export function safeWriteJsonFile(
  filePath: string,
  data: unknown
): Result<void, Error> {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    writeFile(filePath, jsonString);
    return Ok(undefined);
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
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
    cpus: os.cpus().map((cpu: unknown) => ({
      model: (cpu as { model: string }).model,
      speed: (cpu as { speed: number }).speed,
      times: {
        user: (cpu as { times: { user: number } }).times.user,
        nice: (cpu as { times: { nice: number } }).times.nice,
        sys: (cpu as { times: { sys: number } }).times.sys,
        idle: (cpu as { times: { idle: number } }).times.idle,
        irq: (cpu as { times: { irq: number } }).times.irq,
      },
    })),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptime: os.uptime(),
  };
}

export function safeGetSystemInfo(): Result<
  ReturnType<typeof getSystemInfo>,
  Error
> {
  try {
    return Ok(getSystemInfo());
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}
