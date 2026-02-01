// Renderer process storage service
import { EnhancedStorageUtils } from '../lib/storage';

export class StorageService {
  static get = EnhancedStorageUtils.storage.get;
  static set = EnhancedStorageUtils.storage.set;
  static remove = EnhancedStorageUtils.storage.remove;
  static clear = EnhancedStorageUtils.storage.clear;
  static has = EnhancedStorageUtils.storage.has;
  static keys = EnhancedStorageUtils.storage.keys;
}
