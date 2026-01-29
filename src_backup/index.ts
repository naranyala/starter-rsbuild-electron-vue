// Import WinBox CSS
import 'winbox/src/css/winbox.css';

// Import WinBox JS and make it globally available
import WinBox from 'winbox/src/js/winbox.js';

// Make WinBox globally available for the service
declare global {
  interface Window {
    WinBox: typeof import('winbox/src/js/winbox.js').default;
  }
}

// Make WinBox globally available for the service
// Ensure it's available when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    // DOM is still loading, wait for it to be ready
    window.addEventListener('DOMContentLoaded', () => {
      window.WinBox = WinBox;
    });
  } else {
    // DOM is already loaded, assign immediately
    window.WinBox = WinBox;
  }
}

import { createApp } from 'vue';
import './styles/index.css';
import App from './App.vue';

createApp(App).mount('#root');
