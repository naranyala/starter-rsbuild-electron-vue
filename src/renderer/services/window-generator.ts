/**
 * Theme generation utilities for window components
 */
export function generateTheme(title: string): { bg: string; color: string } {
  // Generate a theme based on the title
  const themes: Record<string, { bg: string; color: string }> = {
    'What is Electron?': { bg: '#4a90e2', color: '#ffffff' },
    'Electron Architecture': { bg: '#50c878', color: '#ffffff' },
    'Electron Security': { bg: '#ff6b6b', color: '#ffffff' },
    'Electron Packaging': { bg: '#ffa500', color: '#ffffff' },
    'Electron Native APIs': { bg: '#9c27b0', color: '#ffffff' },
    'Electron Performance': { bg: '#2196f3', color: '#ffffff' },
    'Electron Development': { bg: '#4caf50', color: '#ffffff' },
    'Electron Versions': { bg: '#ff9800', color: '#ffffff' },
  };

  return themes[title] || { bg: '#607d8b', color: '#ffffff' };
}

/**
 * Generate dynamic content based on the title
 */
export function generateWindowContent(title: string): string {
  const contentMap: Record<string, string> = {
    'What is Electron?': `
      <p>Electron is a framework for building cross-platform desktop applications using web technologies like HTML, CSS, and JavaScript. It combines the Chromium rendering engine and the Node.js runtime.</p>
      <p>With Electron, you can develop desktop applications that run on Windows, macOS, and Linux using familiar web technologies. Popular applications like Visual Studio Code, Slack, Discord, and WhatsApp Desktop are built with Electron.</p>
    `,
    'Electron Architecture': `
      <p>Electron applications have two main processes: the Main Process and the Renderer Process. The Main Process controls the life cycle of the app and creates browser windows. The Renderer Process renders the UI and runs in the browser window.</p>
      <p>Communication between processes happens via IPC (Inter-Process Communication). This architecture allows for secure separation of concerns while maintaining flexibility.</p>
    `,
    'Electron Security': `
      <p>Security is crucial in Electron applications. Important practices include: enabling context isolation, disabling nodeIntegration when possible, using CSP (Content Security Policy), validating all input, and sanitizing user-provided content.</p>
      <p>Always run Electron in a secure context and keep your dependencies updated. Follow the principle of least privilege for all operations.</p>
    `,
    'Electron Packaging': `
      <p>Packaging Electron applications involves bundling your code with the Electron runtime to create distributable executables. Popular tools include electron-builder, electron-packager, and electron-forge.</p>
      <p>Each platform (Windows, macOS, Linux) has specific requirements and considerations. Considerations include app size, update mechanisms, code signing, and notarization (especially for macOS).</p>
    `,
    'Electron Native APIs': `
      <p>Electron provides access to many native operating system capabilities through its APIs. These include file system access, notifications, dialogs, tray icons, power management, and more.</p>
      <p>Common APIs include: dialog, file system, clipboard, shell, nativeImage, and screen. Proper use of these APIs enables rich desktop experiences while maintaining security.</p>
    `,
    'Electron Performance': `
      <p>Optimizing Electron applications involves reducing memory usage, improving startup time, and ensuring smooth UI interactions. Key strategies include lazy loading modules, optimizing asset sizes, and using efficient rendering techniques.</p>
      <p>Monitor performance using Chrome DevTools, profile memory usage, and consider using native modules for performance-critical operations.</p>
    `,
    'Electron Development': `
      <p>Developing Electron applications involves setting up a proper development environment, using hot reloading, debugging techniques, and following best practices. Common tools include electron-devtools-installer and various IDE extensions.</p>
      <p>Effective development workflows include using development servers, implementing proper error handling, and maintaining separate configurations for development and production environments.</p>
    `,
    'Electron Versions': `
      <p>Electron versions are tied to specific versions of Chromium and Node.js. Each Electron release includes a specific combination of these technologies. Understanding version compatibility is crucial for maintaining stable applications.</p>
      <p>Regular updates bring security patches, performance improvements, and new APIs. However, updates may also introduce breaking changes, so thorough testing is essential.</p>
    `,
  };

  return contentMap[title] || `<p>Content for ${title} is coming soon.</p>`;
}
