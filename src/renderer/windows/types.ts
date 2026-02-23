/**
 * WinBox Window Types
 */

/**
 * WinBox window instance interface
 */
export interface WinBoxInstance {
  /** Window title */
  title?: string;
  /** Window element */
  element?: HTMLElement;
  /** Window body element */
  body?: HTMLElement;
  /** Is window hidden */
  hidden?: boolean;
  /** Is window minimized */
  min?: boolean;
  /** Is window maximized */
  max?: boolean;
  
  // Lifecycle callbacks
  onclose?: (...args: any[]) => any;
  onminimize?: (...args: any[]) => any;
  onrestore?: (...args: any[]) => any;
  onmaximize?: (...args: any[]) => any;
  onfocus?: (...args: any[]) => any;
  onblur?: (...args: any[]) => any;
  
  // Methods
  close?: (...args: any[]) => any;
  minimize?: (...args: any[]) => any;
  maximize?: (...args: any[]) => any;
  restore?: (...args: any[]) => any;
  hide?: (...args: any[]) => any;
  show?: (...args: any[]) => any;
  focus?: (...args: any[]) => any;
  blur?: (...args: any[]) => any;
  setTitle?: (title: string) => void;
  setBackground?: (color: string) => void;
  setBounds?: (x: number, y: number, width: number, height: number) => void;
  getBounds?: () => { x: number; y: number; width: number; height: number };
}

/**
 * Window manager state
 */
export interface WindowState {
  id: string;
  title: string;
  viewName: string;
  minimized: boolean;
  maximized: boolean;
  focused: boolean;
  hidden: boolean;
  createdAt: Date;
}
