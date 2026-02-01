import net from 'net';

export function getRandomPort(min: number = 3000, max: number = 9999): number {
  const port = Math.floor(Math.random() * (max - min + 1)) + min;
  return port;
}

export async function findAvailablePort(
  min: number = 3000,
  max: number = 9999
): Promise<number> {
  for (let port = min; port <= max; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available ports found between ${min} and ${max}`);
}

export function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => resolve(false));
    server.on('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port, '127.0.0.1');
  });
}

export function parsePortFromUrl(url: string): number | null {
  try {
    const parsed = new URL(url);
    return parsed.port ? parseInt(parsed.port, 10) : null;
  } catch {
    return null;
  }
}

export function createUrlWithPort(host: string, port: number): string {
  return `http://${host}:${port}`;
}
