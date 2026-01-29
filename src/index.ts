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

window.WinBox = WinBox;

import { createApp } from 'vue';
import './styles/index.css';
import App from './App.vue';

createApp(App).mount('#root');
