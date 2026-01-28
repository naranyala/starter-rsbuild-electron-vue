// Window Content Generator for WinBox
export class WindowContentGenerator {
  private contentTemplates: Record<string, string[]>;

  constructor() {
    // Define content templates based on keywords in the title
    this.contentTemplates = {
      electron: [
        'Electron is a framework for building cross-platform desktop applications with web technologies.',
        'With Electron, you can create native-like experiences using HTML, CSS, and JavaScript.',
        'Electron combines the Chromium rendering engine with Node.js runtime.',
        'Popular applications like VS Code, Discord, and Slack are built with Electron.',
      ],
      desktop: [
        'Desktop applications provide native-like experiences on Windows, macOS, and Linux.',
        'They have direct access to system resources and APIs.',
        'Desktop apps can run offline and integrate deeply with the operating system.',
        'Cross-platform development allows one codebase for multiple operating systems.',
      ],
      development: [
        'Modern development practices emphasize rapid prototyping and iterative design.',
        'Development tools help streamline the creation of robust applications.',
        'Version control systems are essential for collaborative development.',
        'Continuous integration ensures code quality throughout the development lifecycle.',
      ],
      api: [
        'Application Programming Interfaces enable communication between different software components.',
        'RESTful APIs follow standard HTTP methods for predictable interactions.',
        'GraphQL provides flexible querying capabilities compared to traditional REST APIs.',
        'APIs are crucial for integrating third-party services and data sources.',
      ],
      native: [
        'Native applications provide optimal performance and user experience.',
        'They integrate seamlessly with platform-specific features and UI guidelines.',
        'Native apps have direct access to device hardware and operating system features.',
        'Performance is typically superior compared to web-based alternatives.',
      ],
      platform: [
        'Cross-platform solutions enable reaching users on multiple operating systems.',
        'Platform abstraction layers hide OS-specific implementation details.',
        'Consistent user experience across platforms improves user satisfaction.',
        'Platform-specific optimizations can enhance performance on each target OS.',
      ],
      default: [
        'This window demonstrates the flexibility of WinBox.js for creating dynamic UI components.',
        'WinBox provides a lightweight solution for window management in web applications.',
        'The modular design allows for customizable window behaviors and appearances.',
        'Windows can be moved, resized, minimized, maximized, and closed as needed.',
        'This content is dynamically generated based on the window title.',
        'WinBox enables desktop-like experiences in web environments.',
      ],
    };
  }

  // Generate content based on the window title
  generateContent(title: string): string {
    const normalizedTitle = title.toLowerCase();
    let selectedTemplate = this.contentTemplates.default;

    // Find a matching template based on keywords in the title
    for (const [keyword, template] of Object.entries(this.contentTemplates)) {
      if (keyword !== 'default' && normalizedTitle.includes(keyword)) {
        selectedTemplate = template;
        break;
      }
    }

    // Randomly select content from the chosen template
    const randomIndex = Math.floor(Math.random() * selectedTemplate.length);
    return selectedTemplate[randomIndex];
  }

  // Generate more comprehensive content for detailed windows
  generateDetailedContent(title: string): string {
    const normalizedTitle = title.toLowerCase();
    const sections: string[] = [];

    // Introduction section
    sections.push(`<h3>About ${title}</h3>`);
    sections.push(`<p>${this.generateContent(title)}</p>`);

    // Feature list based on keywords
    sections.push('<h4>Key Features:</h4>');
    sections.push('<ul>');

    if (normalizedTitle.includes('electron')) {
      sections.push('<li>Cross-platform desktop applications</li>');
      sections.push('<li>Web technology integration</li>');
      sections.push('<li>Native API access</li>');
      sections.push('<li>Large community support</li>');
    } else if (normalizedTitle.includes('development')) {
      sections.push('<li>Rapid prototyping</li>');
      sections.push('<li>Code reusability</li>');
      sections.push('<li>Debugging tools</li>');
      sections.push('<li>Performance optimization</li>');
    } else if (normalizedTitle.includes('api')) {
      sections.push('<li>Data exchange protocols</li>');
      sections.push('<li>Authentication methods</li>');
      sections.push('<li>Error handling</li>');
      sections.push('<li>Rate limiting</li>');
    } else {
      sections.push('<li>Modular architecture</li>');
      sections.push('<li>Customizable UI</li>');
      sections.push('<li>Cross-platform compatibility</li>');
      sections.push('<li>Extensible design</li>');
    }

    sections.push('</ul>');

    // Additional random content
    sections.push('<h4>Additional Information:</h4>');
    sections.push(`<p>${this.generateContent(title)}</p>`);

    return sections.join('');
  }
}