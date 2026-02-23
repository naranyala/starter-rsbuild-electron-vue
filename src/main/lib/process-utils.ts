import { type ChildProcess, exec, spawn } from 'child_process';

export function executeCommand(
  command: string,
  options: { timeout?: number; maxBuffer?: number; cwd?: string } = {}
): Promise<{
  success: boolean;
  stdout: string;
  stderr: string;
  code?: number;
}> {
  return new Promise((resolve, reject) => {
    const { timeout = 30000, maxBuffer = 1024 * 1024, cwd } = options;

    const execOptions = {
      timeout,
      maxBuffer,
      ...(cwd && { cwd }),
    };

    exec(command, execOptions, (error, stdout, stderr) => {
      if (error) {
        resolve({
          success: false,
          stdout: stdout.toString(),
          stderr: stderr.toString(),
          code: error.code,
        });
      } else {
        resolve({
          success: true,
          stdout: stdout.toString(),
          stderr: stderr.toString(),
          code: 0,
        });
      }
    });
  });
}

export function spawnProcess(
  command: string,
  args: string[] = [],
  options: { cwd?: string; env?: Record<string, string> } = {}
): ChildProcess {
  return spawn(command, args, options);
}

export function killProcess(pid: number): boolean {
  try {
    process.kill(pid);
    return true;
  } catch (error) {
    console.error('Error killing process:', error);
    return false;
  }
}

export function getProcessById(pid: number): ChildProcess | null {
  // This is a simplified implementation
  // In a real scenario, you might want to maintain a registry of spawned processes
  try {
    process.kill(pid, 0); // Check if process exists
    return { pid } as ChildProcess;
  } catch (error) {
    return null;
  }
}

export function listProcesses(): number[] {
  // This is a simplified implementation
  // In a real scenario, you might want to use a library like 'ps-list'
  return [];
}
