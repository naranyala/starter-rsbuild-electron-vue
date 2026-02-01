import { WindowFactory } from './window-factory';

interface WindowOptions {
  [key: string]: any;
}

/**
 * Window component for displaying information about Electron Native APIs
 */
export class ElectronNativeAPIsWindow {
  /**
   * Create a window with information about Electron Native APIs
   * @param options - Additional window options
   * @returns The created winbox window instance
   */
  static create(options: WindowOptions = {}): any {
    return WindowFactory.createWindow('Electron Native APIs', null, {
      width: '600px',
      height: '450px',
      ...options,
    });
  }
}
