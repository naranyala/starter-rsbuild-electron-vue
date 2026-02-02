#!/usr/bin/env node

/**
 * Enhanced Logger with structured output and multiple transports
 */

import { ScriptError } from './errors.mjs';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

const LEVELS = {
  ERROR: { value: 0, label: 'ERROR', color: COLORS.red, icon: '✗' },
  WARN: { value: 1, label: 'WARN', color: COLORS.yellow, icon: '⚠' },
  INFO: { value: 2, label: 'INFO', color: COLORS.cyan, icon: 'ℹ' },
  SUCCESS: { value: 2, label: 'SUCCESS', color: COLORS.green, icon: '✓' },
  DEBUG: { value: 3, label: 'DEBUG', color: COLORS.dim, icon: '◆' },
  TRACE: { value: 4, label: 'TRACE', color: COLORS.dim, icon: '→' },
};

class Logger {
  constructor(options = {}) {
    this.level = this.parseLevel(
      options.level || process.env.LOG_LEVEL || 'INFO'
    );
    this.prefix = options.prefix || '';
    this.timestamps = options.timestamps ?? true;
    this.json = options.json || false;
    this.colors = options.colors ?? true;
    this.silent = options.silent || false;
    this.output = options.output || process.stdout;
  }

  parseLevel(level) {
    const upper = level.toUpperCase();
    return LEVELS[upper]?.value ?? LEVELS.INFO.value;
  }

  format(level, message, meta = {}) {
    const levelConfig =
      Object.values(LEVELS).find(l => l.value === level) || LEVELS.INFO;
    const timestamp = this.timestamps ? new Date().toISOString() : '';
    const prefix = this.prefix ? `[${this.prefix}]` : '';

    if (this.json) {
      return JSON.stringify({
        timestamp,
        level: levelConfig.label,
        message,
        prefix: this.prefix,
        ...meta,
      });
    }

    const parts = [
      timestamp &&
        `${COLORS.dim}[${timestamp.split('T')[1].slice(0, 8)}]${COLORS.reset}`,
      `${levelConfig.color}${levelConfig.icon}${COLORS.reset}`,
      prefix && `${COLORS.bright}${prefix}${COLORS.reset}`,
      message,
    ].filter(Boolean);

    return parts.join(' ');
  }

  log(level, message, meta) {
    if (this.silent || level > this.level) return;
    const output = this.format(level, message, meta);
    if (level === LEVELS.ERROR.value) {
      console.error(output);
    } else {
      console.log(output);
    }
  }

  error(message, meta) {
    this.log(LEVELS.ERROR.value, message, meta);
  }

  warn(message, meta) {
    this.log(LEVELS.WARN.value, message, meta);
  }

  info(message, meta) {
    this.log(LEVELS.INFO.value, message, meta);
  }

  success(message, meta) {
    const levelConfig = LEVELS.SUCCESS;
    if (this.silent || levelConfig.value > this.level) return;
    const output = this.format(
      levelConfig.value,
      `${COLORS.green}${message}${COLORS.reset}`,
      meta
    );
    console.log(output);
  }

  debug(message, meta) {
    this.log(LEVELS.DEBUG.value, message, meta);
  }

  trace(message, meta) {
    this.log(LEVELS.TRACE.value, message, meta);
  }

  // Task lifecycle methods
  taskStart(name) {
    this.info(`Starting: ${name}`);
    return { name, startTime: Date.now() };
  }

  taskEnd(task, success = true, error = null) {
    const duration = Date.now() - task.startTime;
    if (success) {
      this.success(`Completed: ${task.name} (${duration}ms)`);
    } else {
      this.error(
        `Failed: ${task.name} (${duration}ms) - ${error?.message || 'Unknown error'}`
      );
    }
    return { ...task, duration, success, error };
  }

  // Section headers
  section(title) {
    const line = '='.repeat(60);
    console.log(`\n${COLORS.cyan}${line}${COLORS.reset}`);
    console.log(`${COLORS.bright}${title}${COLORS.reset}`);
    console.log(`${COLORS.cyan}${line}${COLORS.reset}\n`);
  }

  // Tables and lists
  table(data, headers) {
    if (this.json) {
      console.log(JSON.stringify(data));
      return;
    }

    const colWidths = headers.map((h, i) => {
      const maxData = Math.max(...data.map(row => String(row[i]).length));
      return Math.max(h.length, maxData) + 2;
    });

    const row = cells =>
      cells.map((c, i) => String(c).padEnd(colWidths[i])).join('│');

    console.log(`${COLORS.bright}${row(headers)}${COLORS.reset}`);
    console.log(headers.map((_, i) => '─'.repeat(colWidths[i])).join('┼'));
    for (const row of data) {
      console.log(row(rowData));
    }
  }

  list(items, bullet = '•') {
    items.forEach(item => {
      console.log(`  ${COLORS.dim}${bullet}${COLORS.reset} ${item}`);
    });
  }

  // Progress indication
  progress(current, total, message = '') {
    const percent = Math.round((current / total) * 100);
    const bar = '█'.repeat(Math.round(percent / 5)).padEnd(20, '░');
    process.stdout.write(
      `\r${COLORS.cyan}[${bar}]${COLORS.reset} ${percent}% ${message}`
    );
    if (current === total) process.stdout.write('\n');
  }

  // Terminal title
  setTitle(title) {
    if (process.stdout.isTTY) {
      process.stdout.write(`\x1b]0;${title}\x07`);
    }
  }

  // Create child logger with prefix
  child(prefix) {
    return new Logger({
      level: Object.keys(LEVELS).find(k => LEVELS[k].value === this.level),
      prefix: this.prefix ? `${this.prefix}:${prefix}` : prefix,
      timestamps: this.timestamps,
      json: this.json,
      colors: this.colors,
      silent: this.silent,
    });
  }

  // Log error objects with details
  logError(error) {
    if (error instanceof ScriptError) {
      this.error(`${error.name}: ${error.message}`);
      this.debug(`Code: ${error.code}`);
      if (Object.keys(error.details).length > 0) {
        this.debug(`Details: ${JSON.stringify(error.details, null, 2)}`);
      }
    } else {
      this.error(`Error: ${error.message}`);
    }
    if (this.level >= LEVELS.DEBUG.value && error.stack) {
      this.debug(`Stack: ${error.stack}`);
    }
  }
}

// Create default logger instance
export const logger = new Logger();

// Factory function for creating custom loggers
export function createLogger(options) {
  return new Logger(options);
}

// Silent logger for tests
export const silentLogger = new Logger({ silent: true });

// Pretty logger for CLI
export const cliLogger = new Logger({
  timestamps: false,
  colors: true,
});
