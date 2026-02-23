import { createApp } from 'vue';
import App from './components/App.vue';
import './reset.css';
import './index.css';
import './styles/global.css';
import { pinia } from './stores/pinia';
import { getRendererContainer, provideDIContainer } from './di';

// Initialize the renderer DI container
const container = getRendererContainer({
  version: '0.1.2',
  name: 'electron-vue-rsbuild-bun',
});

const app = createApp(App);

// Provide DI container to all components
app.provide('DIContainer', container);

app.use(pinia);
app.mount('#root');
