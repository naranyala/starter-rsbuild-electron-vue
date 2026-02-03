/**
 * Development server handler
 */
import { spawn } from 'child_process';
import { BuildError, setupGracefulShutdown } from './error-handler.mjs';
import { logger } from './logger.mjs';
import { exec, fsUtils, network } from './utils.mjs';

const KDE_ENV = {
  KDE_DISABLE_WIDGET_ANTIALIASING: '1',
  NO_AT_BRIDGE: '1',
  QTWEBENGINE_DISABLE_SANDBOX: '1',
  ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
  QT_QPA_PLATFORM: 'xcb',
  KIO_DISABLE_CACHE: '1',
  KDE_SESSION_VERSION: '5',
  DESKTOP_SESSION: 'plasma',
  QT_AUTO_SCREEN_SCALE_FACTOR: '0',
  QT_SCALE_FACTOR: '1',
  GTK_THEME: 'Adwaita:dark',
  ELECTRON_FORCE_WINDOW_MENU_BAR: '1',
};

const RSBUILD = './node_modules/.bin/rsbuild';
const ELECTRON = './node_modules/.bin/electron';

export async function startDevWeb(opts = {}) {
  const port = opts.port || 3000;
  const host = opts.host || 'localhost';

  if (!fsUtils.exists(RSBUILD))
    throw new BuildError('Rsbuild not found', 'MISSING_RSBUILD');

  const url = `http://${host}:${port}`;
  logger.info(`Starting web dev server on ${url}...`);

  const dev = spawn(
    RSBUILD,
    ['dev', '--config', 'rsbuild.config.ts', '--port', String(port)],
    {
      env: { ...process.env, NODE_ENV: 'development' },
      stdio: 'inherit',
    }
  );

  setupGracefulShutdown([() => dev.kill()]);

  // Return a promise that never resolves - keeps the process alive
  return new Promise(() => {
    dev.on('close', c => process.exit(c));
    dev.on('error', e => {
      logger.error(`Server error: ${e.message}`);
      process.exit(1);
    });
  });
}

export async function startDevElectron() {
  if (!fsUtils.exists(RSBUILD))
    throw new BuildError('Rsbuild not found', 'MISSING_RSBUILD');
  if (!fsUtils.exists(ELECTRON))
    throw new BuildError('Electron not found', 'MISSING_ELECTRON');

  const port = await network.findPort(4000, 9999);
  const url = `http://localhost:${port}`;

  logger.info(`Starting dev server on port ${port}...`);

  const dev = spawn(
    RSBUILD,
    ['dev', '--config', 'rsbuild.config.ts', '--port', String(port)],
    {
      env: { ...process.env, ...KDE_ENV, NODE_ENV: 'development' },
      stdio: ['pipe', 'pipe', 'pipe'],
    }
  );

  dev.stdout.on('data', d => process.stdout.write(d));
  dev.stderr.on('data', d => process.stderr.write(d));

  setTimeout(async () => {
    try {
      logger.info('Compiling TypeScript...');
      const tsc = exec.sync('npm run build:ts', { stdio: 'inherit' });
      if (!tsc.success) throw new Error('TypeScript failed');

      logger.info('Fixing imports...');
      await fixImports('./dist-ts');

      if (!fsUtils.exists('./dist-ts/package.json')) {
        fsUtils.write(
          './dist-ts/package.json',
          JSON.stringify({ type: 'module' }, null, 2)
        );
      }
      if (fsUtils.exists('./src/preload.js')) {
        fsUtils.copy('./src/preload.js', './dist-ts/preload.js');
      }

      logger.info(`Launching Electron...`);

      const electron = spawn(ELECTRON, ['dist-ts/src/backend/backend-dev.js'], {
        env: {
          ...process.env,
          ...KDE_ENV,
          NODE_ENV: 'development',
          ELECTRON_DEV_SERVER: url,
        },
        stdio: 'inherit',
      });

      electron.on('close', c => {
        dev.kill();
        process.exit(c);
      });
      electron.on('error', e => {
        logger.error(`Electron error: ${e.message}`);
        dev.kill();
      });
    } catch (e) {
      logger.error(`Build error: ${e.message}`);
      dev.kill();
      process.exit(1);
    }
  }, 3000);

  // Return a promise that never resolves - keeps the process alive
  return new Promise(() => {
    dev.on('close', c => process.exit(c));
    dev.on('error', e => {
      logger.error(`Dev server error: ${e.message}`);
      process.exit(1);
    });
  });
}

async function fixImports(dir) {
  const files = getJsFiles(dir);
  let updated = 0;

  for (const f of files) {
    const content = fsUtils.read(f);
    if (
      content &&
      /from\s+["']\.[^"']*["']/.test(content) &&
      !/\.(js|ts|json)/.test(content.split('from')[1]?.split('"')[0] || '')
    ) {
      const newContent = content.replace(
        /(from\s+["']\.[^"']+)(["'])/g,
        '$1.js$2'
      );
      if (newContent !== content) {
        fsUtils.write(f, newContent);
        updated++;
      }
    }
  }

  if (updated) logger.info(`Fixed imports in ${updated} files`);
}

function getJsFiles(dir) {
  const results = [];
  if (!fsUtils.exists(dir)) return results;

  const walk = d => {
    for (const f of fs.readdirSync(d)) {
      const p = `${d}/${f}`;
      const stat = fs.statSync(p);
      if (f.startsWith('.')) continue;
      if (stat.isDirectory()) walk(p);
      else if (f.endsWith('.js') && !f.endsWith('.d.ts')) results.push(p);
    }
  };

  walk(dir);
  return results;
}
