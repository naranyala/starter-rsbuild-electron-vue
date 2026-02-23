import { WindowFactory } from './window-factory';

interface WindowOptions {
  [key: string]: any;
}

/**
 * Window component for displaying information about Electron Performance
 */
export class ElectronPerformanceWindow {
  /**
   * Create a window with information about Electron Performance
   * @param options - Additional window options
   * @returns The created winbox window instance
   */
  static create(options: WindowOptions = {}): any {
    return WindowFactory.createWindow('Electron Performance', null, {
      width: '600px',
      height: '450px',
      ...options,
    });
  }
}
