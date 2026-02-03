import { WindowFactory } from './window-factory';

interface WindowOptions {
  [key: string]: any;
}

/**
 * Window component for displaying information about Electron Development
 */
export class ElectronDevelopmentWindow {
  /**
   * Create a window with information about Electron Development
   * @param options - Additional window options
   * @returns The created winbox window instance
   */
  static create(options: WindowOptions = {}): any {
    return WindowFactory.createWindow('Electron Development', null, {
      width: '600px',
      height: '450px',
      ...options,
    });
  }
}
