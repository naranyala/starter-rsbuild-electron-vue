// Renderer process storage service
import { EnhancedStorageUtils } from '../lib/storage.js';
export class StorageService {
}
StorageService.get = EnhancedStorageUtils.storage.get;
StorageService.set = EnhancedStorageUtils.storage.set;
StorageService.remove = EnhancedStorageUtils.storage.remove;
StorageService.clear = EnhancedStorageUtils.storage.clear;
StorageService.has = EnhancedStorageUtils.storage.has;
StorageService.keys = EnhancedStorageUtils.storage.keys;
//# sourceMappingURL=storage-service.js.map