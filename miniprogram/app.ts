import { ensureDay } from './services/store';

App({
  onLaunch() {
    // Demo 阶段只使用本地存储，确保当天建议在启动时就绪。
    ensureDay();
  },
});
