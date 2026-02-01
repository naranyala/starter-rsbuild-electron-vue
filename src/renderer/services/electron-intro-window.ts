import { WindowFactory } from './window-factory';

interface WindowOptions {
  [key: string]: any;
}

/**
 * Window component for displaying information about Electron
 */
export class ElectronIntroWindow {
  /**
   * Create a window with information about Electron
   * @param options - Additional window options
   * @returns The created winbox window instance
   */
  static create(options: WindowOptions = {}): any {
    return WindowFactory.createWindow('What is Electron?', null, {
      width: '600px',
      height: '450px',
      ...options,
    });
  }
}
