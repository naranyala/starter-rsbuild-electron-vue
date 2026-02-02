/**
 * Enhanced logger with structured logging
 */
const COLORS = {
  RESET: '\x1b[0m',
  FG_RED: '\x1b[31m',
  FG_GREEN: '\x1b[32m',
  FG_YELLOW: '\x1b[33m',
  FG_CYAN: '\x1b[36m',
  DIM: '\x1b[2m',
};

export const LOG_LEVELS = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };

export class EnhancedLogger {
  constructor(options = {}) {
    this.level = LOG_LEVELS[options.level?.toUpperCase()] || LOG_LEVELS.INFO;
    this.prefix = options.prefix || '';
    this.timestamps = options.timestamps !== false;
    this.jsonOutput = options.json || false;
  }

  format(level, message) {
    const timestamp = this.timestamps
      ? `[${new Date().toISOString().split('T')[1].slice(0, 8)}]`
      : '';
    const prefixStr = this.prefix ? `[${this.prefix}]` : '';
    const levelStr = `[${level}]`;

    if (this.jsonOutput) {
      return JSON.stringify({ timestamp, level, message, prefix: this.prefix });
    }

    const parts = [timestamp, levelStr, prefixStr, message].filter(Boolean);
    const formatted = parts.join(' ');

    const colorMap = {
      ERROR: COLORS.FG_RED,
      WARN: COLORS.FG_YELLOW,
      INFO: COLORS.FG_CYAN,
      DEBUG: COLORS.DIM,
    };
    return `${colorMap[level] || ''}${formatted}${COLORS.RESET}`;
  }

  error(message) {
    if (this.level <= LOG_LEVELS.ERROR)
      console.error(this.format('ERROR', message));
  }
  warn(message) {
    if (this.level <= LOG_LEVELS.WARN)
      console.warn(this.format('WARN', message));
  }
  info(message) {
    if (this.level <= LOG_LEVELS.INFO)
      console.log(this.format('INFO', message));
  }
  success(message) {
    if (this.level <= LOG_LEVELS.INFO)
      console.log(`${COLORS.FG_GREEN}✓ ${message}${COLORS.RESET}`);
  }
  debug(message) {
    if (this.level <= LOG_LEVELS.DEBUG)
      console.log(this.format('DEBUG', message));
  }
  log(message) {
    console.log(message);
  }

  setTitle(title) {
    if (process.stdout.isTTY) process.stdout.write(`\x1b]0;${title}\x07`);
  }

  taskStart(task) {
    this.info(`Starting ${task}...`);
  }
  taskComplete(task, ms) {
    if (ms && ms > 0) {
      this.success(`Completed ${task} in ${ms}ms`);
    } else {
      this.success(`Completed ${task}`);
    }
  }
  taskFailed(task, error) {
    this.error(`Failed ${task}: ${error}`);
  }
}

export const logger = new EnhancedLogger({
  level: process.env.LOG_LEVEL || 'INFO',
});
