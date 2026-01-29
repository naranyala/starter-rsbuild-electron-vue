/**
 * File System Utilities for Electron Main Process
 * These utilities are only available in the Node.js environment (Electron main)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Check if a file exists
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}

/**
 * Check if a path is a file
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if path is a file
 */
function isFile(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (error) {
    console.error('Error checking if path is file:', error);
    return false;
  }
}

/**
 * Check if a path is a directory
 * @param {string} dirPath - Path to check
 * @returns {boolean} - True if path is a directory
 */
function isDirectory(dirPath) {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (error) {
    console.error('Error checking if path is directory:', error);
    return false;
  }
}

/**
 * Read a file safely
 * @param {string} filePath - Path to the file
 * @param {string} encoding - File encoding (default: 'utf8')
 * @returns {string|null} - File content or null if error
 */
function readFile(filePath, encoding = 'utf8') {
  try {
    return fs.readFileSync(filePath, encoding);
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
}

/**
 * Write content to a file
 * @param {string} filePath - Path to the file
 * @param {string} content - Content to write
 * @param {string} encoding - File encoding (default: 'utf8')
 * @returns {boolean} - True if successful
 */
function writeFile(filePath, content, encoding = 'utf8') {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, encoding);
    return true;
  } catch (error) {
    console.error('Error writing file:', error);
    return false;
  }
}

/**
 * Read a JSON file safely
 * @param {string} filePath - Path to the JSON file
 * @returns {object|null} - Parsed JSON object or null if error
 */
function readJsonFile(filePath) {
  try {
    if (fileExists(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
    return null;
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return null;
  }
}

/**
 * Write data to a JSON file
 * @param {string} filePath - Path to the JSON file
 * @param {object} data - Data to write
 * @param {number|undefined} space - JSON spacing (default: 2)
 * @returns {boolean} - True if successful
 */
function writeJsonFile(filePath, data, space = 2) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, space), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing JSON file:', error);
    return false;
  }
}

/**
 * Create a directory recursively
 * @param {string} dirPath - Directory path to create
 * @returns {boolean} - True if successful
 */
function createDirectory(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error('Error creating directory:', error);
    return false;
  }
}

/**
 * Delete a file or directory recursively
 * @param {string} targetPath - Path to delete
 * @returns {boolean} - True if successful
 */
function deletePath(targetPath) {
  try {
    if (!fs.existsSync(targetPath)) {
      return true;
    }

    const stats = fs.statSync(targetPath);
    if (stats.isDirectory()) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(targetPath);
    }
    return true;
  } catch (error) {
    console.error('Error deleting path:', error);
    return false;
  }
}

/**
 * Copy a file or directory
 * @param {string} sourcePath - Source path
 * @param {string} destPath - Destination path
 * @returns {boolean} - True if successful
 */
function copyPath(sourcePath, destPath) {
  try {
    if (!fs.existsSync(sourcePath)) {
      return false;
    }

    const stats = fs.statSync(sourcePath);
    if (stats.isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
    return true;
  } catch (error) {
    console.error('Error copying path:', error);
    return false;
  }
}

/**
 * Copy a directory recursively
 * @param {string} sourceDir - Source directory
 * @param {string} destDir - Destination directory
 */
function copyDirectory(sourceDir, destDir) {
  createDirectory(destDir);

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

/**
 * List files in a directory
 * @param {string} dirPath - Directory path
 * @param {boolean} recursive - Whether to list recursively
 * @returns {string[]} - Array of file paths
 */
function listFiles(dirPath, recursive = false) {
  try {
    if (!fs.existsSync(dirPath)) {
      return [];
    }

    const files = [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isFile()) {
        files.push(fullPath);
      } else if (entry.isDirectory() && recursive) {
        files.push(...listFiles(fullPath, true));
      }
    }

    return files;
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}

/**
 * Get file size in bytes
 * @param {string} filePath - Path to the file
 * @returns {number|null} - File size in bytes or null if error
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    console.error('Error getting file size:', error);
    return null;
  }
}

/**
 * Get file modification time
 * @param {string} filePath - Path to the file
 * @returns {Date|null} - Modification time or null if error
 */
function getFileModifiedTime(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime;
  } catch (error) {
    console.error('Error getting file modification time:', error);
    return null;
  }
}

/**
 * Watch a file or directory for changes
 * @param {string} targetPath - Path to watch
 * @param {Function} callback - Callback function for changes
 * @param {object} options - Watch options
 * @returns {fs.FSWatcher|null} - File system watcher or null if error
 */
function watchPath(targetPath, callback, options = {}) {
  try {
    return fs.watch(targetPath, options, callback);
  } catch (error) {
    console.error('Error watching path:', error);
    return null;
  }
}

/**
 * Get app data directory
 * @param {string} appName - Application name
 * @returns {string} - App data directory path
 */
function getAppDataDir(appName) {
  const platform = process.platform;

  let basePath;
  switch (platform) {
    case 'win32':
      basePath =
        process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
      break;
    case 'darwin':
      basePath = path.join(os.homedir(), 'Library', 'Application Support');
      break;
    default:
      basePath =
        process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
  }

  return path.join(basePath, appName);
}

/**
 * Get user home directory
 * @returns {string} - User home directory path
 */
function getHomeDir() {
  return os.homedir();
}

/**
 * Get temporary directory
 * @returns {string} - Temporary directory path
 */
function getTempDir() {
  return os.tmpdir();
}

/**
 * Get system information
 * @returns {object} - System information object
 */
function getSystemInfo() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    hostname: os.hostname(),
    cpus: os.cpus(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    homeDir: os.homedir(),
    tempDir: os.tmpdir(),
  };
}

module.exports = {
  fileExists,
  isFile,
  isDirectory,
  readFile,
  writeFile,
  readJsonFile,
  writeJsonFile,
  createDirectory,
  deletePath,
  copyPath,
  copyDirectory,
  listFiles,
  getFileSize,
  getFileModifiedTime,
  watchPath,
  getAppDataDir,
  getHomeDir,
  getTempDir,
  getSystemInfo,
};
