// Dynamic menu configuration for the frontend fuzzy search
// This allows for modular design where menu items can be easily updated

// Define TypeScript interface for menu items
interface MenuItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export const menuData: MenuItem[] = [
  {
    id: 'electron-intro',
    title: 'What is Electron?',
    content:
      '<p>Electron is a framework for building cross-platform desktop applications using web technologies like HTML, CSS, and JavaScript. It combines the Chromium rendering engine and the Node.js runtime.</p><p>With Electron, you can develop desktop applications that run on Windows, macOS, and Linux using familiar web technologies. Popular applications like Visual Studio Code, Slack, Discord, and WhatsApp Desktop are built with Electron.</p><div class="integration-demo"><h4>Potential Integration Demo:</h4><p>Create a custom UI with native OS controls, implement drag-and-drop functionality, and integrate with system notifications. Mock-up: A file explorer with custom context menus and native file operations.</p></div>',
    category: 'framework',
    tags: ['electron', 'desktop', 'chromium', 'nodejs', 'cross-platform', 'ui', 'components'],
  },
  {
    id: 'electron-architecture',
    title: 'Electron Architecture',
    content:
      '<p>Electron applications have two main processes: the Main Process and the Renderer Process. The Main Process controls the life cycle of the app and creates browser windows. The Renderer Process renders the UI and runs in the browser window.</p><p>Communication between processes happens via IPC (Inter-Process Communication). This architecture allows for secure separation of concerns while maintaining flexibility.</p><div class="integration-demo"><h4>Potential Integration Demo:</h4><p>Mock-up: A multi-window application with a main window and floating panels that communicate via IPC. Each panel could represent a different aspect of the application (settings, preview, tools).</p></div>',
    category: 'architecture',
    tags: ['main-process', 'renderer-process', 'ipc', 'architecture', 'system', 'os'],
  },
  {
    id: 'electron-security',
    title: 'Electron Security Best Practices',
    content:
      '<p>Security is crucial in Electron applications. Important practices include: enabling context isolation, disabling nodeIntegration when possible, using CSP (Content Security Policy), validating all input, and sanitizing user-provided content.</p><p>Always run Electron in a secure context and keep your dependencies updated. Follow the principle of least privilege for all operations.</p><div class="integration-demo"><h4>Potential Integration Demo:</h4><p>Mock-up: A security dashboard showing real-time security status, permission controls, and vulnerability scanning. Includes authentication flows and secure credential storage.</p></div>',
    category: 'security',
    tags: ['security', 'context-isolation', 'csp', 'best-practices', 'authentication', 'csp'],
  },
  {
    id: 'electron-packaging',
    title: 'Packaging and Distribution',
    content:
      '<p>Electron applications can be packaged for distribution using tools like electron-builder, electron-forge, or electron-packager. These tools create installable executables for Windows, macOS, and Linux.</p><p>Configuration includes app metadata, icons, installer options, and platform-specific settings. Proper packaging ensures a professional user experience across all platforms.</p><div class="integration-demo"><h4>Potential Integration Demo:</h4><p>Mock-up: A packaging wizard with platform selection, icon upload, installer customization, and build progress tracking. Includes automated update mechanisms and version management.</p></div>',
    category: 'packaging',
    tags: ['packaging', 'distribution', 'electron-builder', 'installer', 'devtools', 'testing'],
  },
  {
    id: 'electron-native-apis',
    title: 'Native Operating System APIs',
    content:
      '<p>Electron provides access to native OS features through its APIs: file system operations, dialog boxes, notifications, tray icons, clipboard, and more. These APIs bridge the gap between web technologies and desktop functionality.</p><p>Common native integrations include file dialogs, system notifications, context menus, and deep OS integration for a native-like experience.</p><div class="integration-demo"><h4>Potential Integration Demo:</h4><p>Mock-up: A system tray application with quick access to common functions, file monitoring capabilities, and deep OS integration. Includes hardware access like camera, microphone, and Bluetooth.</p></div>',
    category: 'api',
    tags: ['native-api', 'file-system', 'notifications', 'dialogs', 'system', 'os', 'filesystem'],
  },
  {
    id: 'electron-performance',
    title: 'Performance Optimization',
    content:
      '<p>Optimizing Electron apps involves reducing memory usage, improving startup time, and efficient resource management. Techniques include code splitting, lazy loading, proper cleanup of event listeners, and optimizing asset loading.</p><p>Monitor performance with Chrome DevTools and consider using native modules for CPU-intensive tasks. Efficient IPC communication also improves responsiveness.</p><div class="integration-demo"><h4>Potential Integration Demo:</h4><p>Mock-up: A performance monitor showing real-time metrics like memory usage, CPU load, and IPC latency. Includes profiling tools and optimization recommendations.</p></div>',
    category: 'performance',
    tags: ['performance', 'optimization', 'memory', 'startup-time', 'optimization', 'memory'],
  },
  {
    id: 'electron-development',
    title: 'Development Workflow',
    content:
      '<p>Effective Electron development involves using tools like Hot Module Replacement (HMR), development servers, and proper debugging setups. Use electron-reload for automatic restarts during development.</p><p>Separate development and production configurations, implement proper error handling, and use build tools to automate repetitive tasks for a smooth development experience.</p><div class="integration-demo"><h4>Potential Integration Demo:</h4><p>Mock-up: An integrated development environment with live preview, debugging tools, and plugin management. Includes hot reload functionality and error reporting.</p></div>',
    category: 'development',
    tags: ['development', 'workflow', 'debugging', 'hmr', 'devtools', 'debugging', 'development', 'testing'],
  },
  {
    id: 'electron-versions',
    title: 'Version Management',
    content:
      '<p>Managing Electron versions is important for stability and security. Regularly update to newer versions to get security patches and performance improvements. Consider the compatibility of Node.js and Chromium versions in each Electron release.</p><p>Test your application thoroughly after version upgrades and maintain a consistent version across your team to avoid compatibility issues.</p><div class="integration-demo"><h4>Potential Integration Demo:</h4><p>Mock-up: A version control dashboard showing current Electron version, available updates, and compatibility matrix. Includes automated testing for version upgrades.</p></div>',
    category: 'maintenance',
    tags: ['version', 'updates', 'compatibility', 'maintenance', 'devtools', 'testing'],
  },
];
