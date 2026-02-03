// Main process app service
import { registerAppHandlers as registerAppHandlersUtil } from '../lib/ipc-utils';

export class AppService {
  static registerHandlers = registerAppHandlersUtil;
}
