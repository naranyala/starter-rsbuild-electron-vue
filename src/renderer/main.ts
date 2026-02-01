import {
  createApp,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  ref,
} from 'vue';
import App from './App.vue';
import '../../reset.css';
import '../../index.css';
import './styles/global.css';
import 'winbox/dist/css/winbox.min.css';

let app: ReturnType<typeof createApp> | null = null;
let isMounted = false;

function mountApp() {
  if (isMounted) return;

  const root = document.getElementById('root');
  if (!root) return;

  // Check if already has app mounted
  if (root.querySelector('.App')) {
    isMounted = true;
    return;
  }

  app = createApp(App as any);
  app.mount('#root');
  isMounted = true;
}

function unmountApp() {
  if (!isMounted) return;

  if (app) {
    try {
      app.unmount();
      app = null;
    } catch (e) {
      console.warn('Failed to unmount app:', e);
    }
  }

  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '<div id="root"></div>';
  }

  isMounted = false;
}

// Clean unmount on page hide
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    unmountApp();
  }
});

// Initial mount
mountApp();
