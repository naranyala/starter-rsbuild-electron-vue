declare module 'winbox/src/js/winbox.js' {
  interface WinBoxOptions {
    id?: string;
    title?: string;
    width?: string | number;
    height?: string | number;
    x?: string | number;
    y?: string | number;
    top?: string | number;
    left?: string | number;
    right?: string | number;
    bottom?: string | number;
    minwidth?: string | number;
    minheight?: string | number;
    maxwidth?: string | number;
    maxheight?: string | number;
    mount?: HTMLElement;
    html?: string;
    url?: string;
    modal?: boolean;
    background?: string;
    border?: string;
    header?: string | number;
    className?: string | string[];
    oncreate?: (params: any) => void;
    onclose?: () => boolean;
    onfocus?: () => void;
    onblur?: () => void;
    onmove?: () => void;
    onresize?: () => void;
    onfullscreen?: () => void;
    onmaximize?: () => void;
    onminimize?: () => void;
    onrestore?: () => void;
    onhide?: () => void;
    onshow?: () => void;
    onload?: () => void;
  }

  class WinBox {
    constructor(options: WinBoxOptions);
    close(): void;
    focus(): void;
    blur(): void;
    hide(): void;
    show(): void;
    minimize(): void;
    maximize(): void;
    fullscreen(): void;
    restore(): void;
    move(): WinBox;
    resize(): WinBox;
    mount(element: HTMLElement): WinBox;
    unmount(element?: HTMLElement): WinBox;
    setTitle(title: string): WinBox;
    setIcon(src: string): WinBox;
    setBackground(background: string): WinBox;
    setUrl(url: string, onload?: () => void): WinBox;
    addClass(className: string): WinBox;
    removeClass(className: string): WinBox;
    hasClass(className: string): boolean;
  }

  export default WinBox;
}

declare global {
  interface Window {
    WinBox: typeof import('winbox/src/js/winbox.js').default;
  }
}