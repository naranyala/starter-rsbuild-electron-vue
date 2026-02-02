#!/usr/bin/env node

/**
 * Network Utilities
 * Port management, server utilities, and network operations
 */

import http from 'node:http';
import net from 'node:net';
import { NetworkError } from '../core/errors.mjs';
import { logger } from '../core/logger.mjs';

/**
 * Check if a port is available
 */
export function isPortAvailable(port, host = '127.0.0.1') {
  return new Promise(resolve => {
    const server = net.createServer();

    server.unref();
    server.on('error', () => resolve(false));
    server.on('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, host);
  });
}

/**
 * Find an available port in a range
 */
export async function findAvailablePort(
  min = 3000,
  max = 9999,
  maxAttempts = 100
) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const port = Math.floor(Math.random() * (max - min + 1)) + min;

    if (await isPortAvailable(port)) {
      logger.debug(`Found available port: ${port}`);
      return port;
    }
  }

  throw NetworkError.portUnavailable(`${min}-${max}`, maxAttempts);
}

/**
 * Get the next available port starting from a given port
 */
export async function getNextAvailablePort(startPort, host = '127.0.0.1') {
  let port = startPort;

  while (port < 65535) {
    if (await isPortAvailable(port, host)) {
      return port;
    }
    port++;
  }

  throw NetworkError.portUnavailable(`${startPort}+`, 65535 - startPort);
}

/**
 * Wait for a port to become available
 */
export function waitForPort(
  port,
  host = '127.0.0.1',
  timeout = 30000,
  interval = 500
) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = async () => {
      if (Date.now() - startTime > timeout) {
        reject(
          NetworkError.connectionFailed(
            `http://${host}:${port}`,
            new Error('Timeout')
          )
        );
        return;
      }

      const available = await isPortAvailable(port, host);
      if (!available) {
        // Port is in use, meaning server is running
        resolve(true);
        return;
      }

      setTimeout(check, interval);
    };

    check();
  });
}

/**
 * Wait for a URL to be reachable
 */
export function waitForUrl(url, timeout = 30000, interval = 500) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      if (Date.now() - startTime > timeout) {
        reject(NetworkError.connectionFailed(url, new Error('Timeout')));
        return;
      }

      http
        .get(url, res => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve(true);
          } else {
            setTimeout(check, interval);
          }
        })
        .on('error', () => {
          setTimeout(check, interval);
        });
    };

    check();
  });
}

/**
 * Get local IP addresses
 */
export function getLocalAddresses() {
  const interfaces = require('node:os').networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          name,
          address: iface.address,
          family: iface.family,
        });
      }
    }
  }

  return addresses;
}

/**
 * Check if a URL is valid
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse URL components
 */
export function parseUrl(url) {
  try {
    const parsed = new URL(url);
    return {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? '443' : '80'),
      pathname: parsed.pathname,
      search: parsed.search,
      hash: parsed.hash,
    };
  } catch (_error) {
    throw new Error(`Invalid URL: ${url}`);
  }
}

/**
 * Create a simple health check server
 */
export function createHealthCheckServer(port, checks = {}) {
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      const results = {};
      let healthy = true;

      for (const [name, check] of Object.entries(checks)) {
        try {
          results[name] = check();
          if (!results[name]) healthy = false;
        } catch (_error) {
          results[name] = false;
          healthy = false;
        }
      }

      res.writeHead(healthy ? 200 : 503, {
        'Content-Type': 'application/json',
      });
      res.end(JSON.stringify({ healthy, checks: results }));
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  server.listen(port);
  return server;
}

/**
 * Ping a host
 */
export async function ping(host, timeout = 5000) {
  const { execSyncSafe } = await import('./exec.mjs');

  try {
    const result = execSyncSafe(`ping -c 1 -W ${timeout / 1000} ${host}`, {
      log: false,
      stdio: 'pipe',
    });
    return result.success;
  } catch {
    return false;
  }
}

/**
 * Check if we have internet connectivity
 */
export async function hasInternetConnection() {
  return (await ping('8.8.8.8', 3000)) || (await ping('1.1.1.1', 3000));
}

// Export all as default object
export default {
  isPortAvailable,
  findAvailablePort,
  getNextAvailablePort,
  waitForPort,
  waitForUrl,
  getLocalAddresses,
  isValidUrl,
  parseUrl,
  createHealthCheckServer,
  ping,
  hasInternetConnection,
};
