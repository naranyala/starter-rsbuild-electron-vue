import { createApp } from 'vue';
import App from './components/App.vue';
import './reset.css';
import './index.css';
import './styles/global.css';
import { pinia } from './stores/pinia';

const app = createApp(App);
app.use(pinia);
app.mount('#root');
