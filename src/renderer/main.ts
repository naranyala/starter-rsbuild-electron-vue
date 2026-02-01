import { createApp } from 'vue';
import App from './App.vue';
import '../../reset.css';
import '../../index.css';
import './styles/global.css';
import 'winbox/dist/css/winbox.min.css';
import { useElectron } from './composables/use-electron';

createApp(App).mount('#root');
