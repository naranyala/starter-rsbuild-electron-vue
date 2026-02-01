// Shared API contracts and interfaces
export interface UseCaseContract {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

// File system operation contracts
export interface ReadFileContract {
  filePath: string;
}

export interface WriteFileContract {
  filePath: string;
  content: string;
}

export interface ExistsContract {
  filePath: string;
}

export interface MkdirContract {
  dirPath: string;
}

export interface ReaddirContract {
  dirPath: string;
}

export interface DeleteFileContract {
  filePath: string;
}

// Window operation contracts
export interface SetBoundsContract {
  x: number;
  y: number;
  width: number;
  height: number;
}

// System info contract
export interface SystemInfoContract {
  platform: string;
  arch: string;
  release: string;
  hostname: string;
  cpus: any[]; // Simplified for now
  totalMemory: number;
  freeMemory: number;
  homeDir: string;
  tempDir: string;
}

// Process operation contracts
export interface ExecCommandContract {
  command: string;
  options?: Record<string, any>;
}

export interface SpawnProcessContract {
  command: string;
  args: string[];
  options?: Record<string, any>;
}

export interface KillProcessContract {
  pid: number;
}

// Result wrapper for operations
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}
