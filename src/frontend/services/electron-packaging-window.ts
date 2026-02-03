import { WindowFactory } from './window-factory';

interface WindowOptions {
  [key: string]: any;
}

/**
 * Window component for displaying information about Electron Packaging
 */
export class ElectronPackagingWindow {
  /**
   * Create a window with information about Electron Packaging
   * @param options - Additional window options
   * @returns The created winbox window instance
   */
  static create(options: WindowOptions = {}): any {
    return WindowFactory.createWindow('Electron Packaging', null, {
      width: '600px',
      height: '450px',
      ...options,
    });
  }
}
