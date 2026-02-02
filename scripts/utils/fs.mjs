#!/usr/bin/env node

/**
 * File System Utilities
 * Safe file operations with proper error handling
 */

import fs from 'node:fs';
import path from 'node:path';
import { FileSystemError, ValidationError } from '../core/errors.mjs';

/**
 * Check if path exists
 */
export function exists(filepath) {
  try {
    return fs.existsSync(filepath);
  } catch {
    return false;
  }
}

/**
 * Check if path is a file
 */
export function isFile(filepath) {
  try {
    return fs.statSync(filepath).isFile();
  } catch {
    return false;
  }
}

/**
 * Check if path is a directory
 */
export function isDirectory(filepath) {
  try {
    return fs.statSync(filepath).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Read file contents with error handling
 */
export function readFile(filepath, encoding = 'utf8') {
  if (!exists(filepath)) {
    throw FileSystemError.readFailed(
      filepath,
      new Error('File does not exist')
    );
  }
  if (!isFile(filepath)) {
    throw FileSystemError.readFailed(filepath, new Error('Path is not a file'));
  }

  try {
    return fs.readFileSync(filepath, encoding);
  } catch (error) {
    throw FileSystemError.readFailed(filepath, error);
  }
}

/**
 * Write file with error handling and directory creation
 */
export function writeFile(filepath, content, encoding = 'utf8') {
  try {
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, content, encoding);
    return true;
  } catch (error) {
    throw FileSystemError.writeFailed(filepath, error);
  }
}

/**
 * Create directory recursively
 */
export function mkdir(dirpath) {
  try {
    if (!exists(dirpath)) {
      fs.mkdirSync(dirpath, { recursive: true });
    }
    return true;
  } catch (error) {
    throw FileSystemError.writeFailed(dirpath, error);
  }
}

/**
 * Remove file or directory
 */
export function remove(filepath) {
  try {
    if (exists(filepath)) {
      fs.rmSync(filepath, { recursive: true, force: true });
    }
    return true;
  } catch (error) {
    throw FileSystemError.writeFailed(filepath, error);
  }
}

/**
 * Copy file or directory
 */
export function copy(src, dest) {
  if (!exists(src)) {
    throw FileSystemError.copyFailed(
      src,
      dest,
      new Error('Source does not exist')
    );
  }

  try {
    mkdir(path.dirname(dest));

    if (isDirectory(src)) {
      fs.cpSync(src, dest, { recursive: true });
    } else {
      fs.copyFileSync(src, dest);
    }
    return true;
  } catch (error) {
    throw FileSystemError.copyFailed(src, dest, error);
  }
}

/**
 * Move/rename file or directory
 */
export function move(src, dest) {
  if (!exists(src)) {
    throw FileSystemError.copyFailed(
      src,
      dest,
      new Error('Source does not exist')
    );
  }

  try {
    mkdir(path.dirname(dest));
    fs.renameSync(src, dest);
    return true;
  } catch (error) {
    throw FileSystemError.copyFailed(src, dest, error);
  }
}

/**
 * List directory contents
 */
export function list(dirpath, options = {}) {
  if (!exists(dirpath)) {
    throw FileSystemError.readFailed(
      dirpath,
      new Error('Directory does not exist')
    );
  }
  if (!isDirectory(dirpath)) {
    throw FileSystemError.readFailed(
      dirpath,
      new Error('Path is not a directory')
    );
  }

  try {
    const items = fs.readdirSync(dirpath);
    if (options.recursive) {
      return walk(dirpath, options);
    }
    return items.map(name => ({
      name,
      path: path.join(dirpath, name),
      isFile: isFile(path.join(dirpath, name)),
      isDirectory: isDirectory(path.join(dirpath, name)),
    }));
  } catch (error) {
    throw FileSystemError.readFailed(dirpath, error);
  }
}

/**
 * Walk directory recursively
 */
export function walk(dirpath, options = {}) {
  const results = [];

  function walkDir(currentPath, relativePath = '') {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      if (item.startsWith('.') && !options.includeHidden) continue;

      const fullPath = path.join(currentPath, item);
      const relPath = path.join(relativePath, item);
      const isDir = isDirectory(fullPath);

      if (isDir) {
        if (options.includeDirs) {
          results.push({
            name: item,
            path: fullPath,
            relativePath: relPath,
            isFile: false,
            isDirectory: true,
          });
        }
        walkDir(fullPath, relPath);
      } else {
        const ext = path.extname(item);
        if (options.filter && !options.filter(ext, item)) continue;

        results.push({
          name: item,
          path: fullPath,
          relativePath: relPath,
          isFile: true,
          isDirectory: false,
          extension: ext,
        });
      }
    }
  }

  walkDir(dirpath);
  return results;
}

/**
 * Get file stats
 */
export function stat(filepath) {
  if (!exists(filepath)) {
    return null;
  }

  try {
    const stats = fs.statSync(filepath);
    return {
      size: stats.size,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime,
    };
  } catch {
    return null;
  }
}

/**
 * Update file modification time
 */
export function touch(filepath) {
  const now = new Date();
  if (exists(filepath)) {
    fs.utimesSync(filepath, now, now);
  } else {
    writeFile(filepath, '');
  }
}

/**
 * Ensure directory exists (mkdir -p)
 */
export function ensureDir(dirpath) {
  return mkdir(dirpath);
}

/**
 * Empty directory contents
 */
export function emptyDir(dirpath) {
  if (!exists(dirpath)) {
    mkdir(dirpath);
    return;
  }

  const items = list(dirpath);
  for (const item of items) {
    remove(item.path);
  }
}

/**
 * Find files by extension
 */
export function findByExtension(dirpath, extensions) {
  const extArray = Array.isArray(extensions) ? extensions : [extensions];
  return walk(dirpath, {
    filter: ext => extArray.includes(ext),
  });
}

/**
 * Read JSON file
 */
export function readJson(filepath) {
  const content = readFile(filepath);
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new ValidationError(
      `Invalid JSON in ${filepath}: ${error.message}`,
      'json'
    );
  }
}

/**
 * Write JSON file
 */
export function writeJson(filepath, data, pretty = true) {
  const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  writeFile(filepath, content);
}

/**
 * Get file size in human readable format
 */
export function getSize(filepath) {
  const stats = stat(filepath);
  if (!stats) return null;

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = stats.size;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Export all as default object for convenience
export default {
  exists,
  isFile,
  isDirectory,
  readFile,
  writeFile,
  mkdir,
  remove,
  copy,
  move,
  list,
  walk,
  stat,
  touch,
  ensureDir,
  emptyDir,
  findByExtension,
  readJson,
  writeJson,
  getSize,
};
