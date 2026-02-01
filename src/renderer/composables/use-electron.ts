// Vue composable for Electron API integration
import { onMounted, onUnmounted, ref } from 'vue';
import { ElectronApiService } from '../services/electron-api';

export function useElectron() {
  const isElectron = ref(false);
  const platform = ref('');
  const version = ref('');

  onMounted(async () => {
    isElectron.value = !!window && !!(window as any).electronAPI;

    if (isElectron.value) {
      try {
        platform.value = await ElectronApiService.getPlatform();
        version.value = await ElectronApiService.getVersion();
      } catch (error) {
        console.error('Error getting Electron info:', error);
      }
    }
  });

  return {
    isElectron,
    platform,
    version,
    api: ElectronApiService.api,
    nodeEnv: ElectronApiService.nodeEnv,
  };
}
