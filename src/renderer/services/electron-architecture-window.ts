import { WindowFactory } from './window-factory';

interface WindowOptions {
  [key: string]: any;
}

/**
 * Window component for displaying information about Electron Architecture
 */
export class ElectronArchitectureWindow {
  /**
   * Create a window with information about Electron Architecture
   * @param options - Additional window options
   * @returns The created winbox window instance
   */
  static create(options: WindowOptions = {}): any {
    return WindowFactory.createWindow('Electron Architecture', null, {
      width: '600px',
      height: '450px',
      ...options,
    });
  }
}
