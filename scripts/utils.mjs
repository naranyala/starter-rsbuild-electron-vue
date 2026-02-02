/**
 * File system and process utilities
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import net from 'net';
import path from 'path';
import { BuildError, ProcessError, ValidationError } from './error-handler.mjs';
import { logger } from './logger.mjs';

export const fsUtils = {
  exists: p => fs.existsSync(p),

  read: p => {
    try {
      return fs.readFileSync(p, 'utf8');
    } catch (e) {
      return null;
    }
  },

  write: (p, c) => {
    try {
      fs.writeFileSync(p, c, 'utf8');
      return true;
    } catch (e) {
      return false;
    }
  },

  mkdir: p => {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  },

  rm: p => {
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
  },

  copy: (src, dest) => {
    try {
      fsUtils.mkdir(path.dirname(dest));
      fs.copyFileSync(src, dest);
      return true;
    } catch (e) {
      return false;
    }
  },
};

export const exec = {
  sync: (cmd, opts = {}) => {
    try {
      const r = execSync(cmd, { encoding: 'utf8', stdio: 'pipe', ...opts });
      return { success: true, code: 0, stdout: r, stderr: '' };
    } catch (e) {
      return {
        success: false,
        code: e.status || 1,
        stdout: e.stdout || '',
        stderr: e.stderr || e.message,
      };
    }
  },

  syncOrFail: (cmd, opts = {}) => {
    const r = exec.sync(cmd, opts);
    if (!r.success)
      throw new ProcessError(
        `Command failed: ${cmd}`,
        r.code,
        r.stdout,
        r.stderr
      );
    return r.stdout;
  },

  spawn: (cmd, args, opts = {}) => {
    return new Promise((resolve, reject) => {
      const child = spawn(cmd, args, { stdio: 'inherit', ...opts });
      child.on('close', code => resolve({ success: code === 0, code }));
      child.on('error', err => reject(err));
    });
  },
};

export const network = {
  findPort: async (min = 3000, max = 9999) => {
    for (let i = 0; i < 100; i++) {
      const p = Math.floor(Math.random() * (max - min + 1)) + min;
      if (
        await new Promise(r => {
          const s = net.createServer();
          s.unref();
          s.on('error', () => r(false));
          s.on('listening', () => {
            s.close(() => r(true));
          });
          s.listen(p, '127.0.0.1');
        })
      )
        return p;
    }
    throw new BuildError('Could not find available port', 'NO_PORT');
  },
};

export const validate = {
  path: (p, opts = {}) => {
    if (!p || typeof p !== 'string')
      throw new ValidationError('Invalid path', 'path');
    if (opts.mustExist && !fs.existsSync(p))
      throw new ValidationError(`Path not found: ${p}`, 'path');
    if (opts.mustBeFile && !fs.statSync(p).isFile())
      throw new ValidationError(`Not a file: ${p}`, 'path');
    if (opts.mustBeDir && !fs.statSync(p).isDirectory())
      throw new ValidationError(`Not a directory: ${p}`, 'path');
    return true;
  },

  port: p => {
    const n = Number(p);
    if (isNaN(n) || n < 1024 || n > 65535)
      throw new ValidationError(`Invalid port: ${p}`, 'port');
    return n;
  },
};
