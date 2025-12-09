/**
 * Electron 主进程入口
 * 负责应用生命周期管理和模块初始化
 */

import { app } from 'electron';
import started from 'electron-squirrel-startup';
import 'dotenv/config';
import { initMenu } from './menu';
import { registerAllIPCHandlers, cleanupIPCHandlers } from './ipc/handlers';
import { registerAllProtocols, cleanupProtocols } from './ipc/protocol';
import {
  createMainWindow,
  getOrCreateMainWindow,
  closeAllWindows,
  getAllWindows,
} from './window/manager';

// ============ 常量定义 ============

const IS_DEV = process.env.NODE_ENV === 'development';

// ============ 工具函数 ============

/**
 * 日志工具
 */
const logger = {
  info: (...args: any[]) => {
    if (IS_DEV) console.log('[MAIN-INFO]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[MAIN-ERROR]', ...args);
  },
  warn: (...args: any[]) => {
    if (IS_DEV) console.warn('[MAIN-WARN]', ...args);
  },
};

// ============ Windows 安装处理 ============

// 处理 Windows 安装/卸载时的快捷方式创建
if (started) {
  app.quit();
}

// ============ 应用生命周期 ============

/**
 * 应用准备就绪
 */
app.whenReady().then(async () => {
  logger.info('应用启动中...');
  logger.info('环境:', IS_DEV ? '开发环境' : '生产环境');

  try {
    // 1. 注册自定义协议
    registerAllProtocols();

    // 2. 注册 IPC 处理器
    // 需要传入 updateMenuLanguage 函数
    const { updateMenuLanguage } = await import('./menu');
    registerAllIPCHandlers(updateMenuLanguage);

    // 3. 创建主窗口
    await createMainWindow();

    // 4. 初始化应用菜单
    initMenu();

    logger.info('应用启动完成');
  } catch (error) {
    logger.error('应用启动失败:', error);
    app.quit();
  }
});

/**
 * 所有窗口关闭
 */
app.on('window-all-closed', () => {
  logger.info('所有窗口已关闭');

  // macOS 上保持应用运行
  if (process.platform !== 'darwin') {
    logger.info('退出应用');
    app.quit();
  }
});

/**
 * 应用激活（macOS）
 */
app.on('activate', async () => {
  logger.info('应用被激活');

  // macOS 上点击 Dock 图标时重新创建窗口
  if (getAllWindows().length === 0) {
    logger.info('没有窗口，创建新窗口');
    await getOrCreateMainWindow();
  }
});

/**
 * 应用即将退出
 */
app.on('before-quit', () => {
  logger.info('应用即将退出');
});

/**
 * 应用退出
 */
app.on('will-quit', () => {
  logger.info('清理资源...');

  // 清理 IPC 处理器
  cleanupIPCHandlers();

  // 清理协议处理器
  cleanupProtocols();

  // 关闭所有窗口
  closeAllWindows();

  logger.info('资源清理完成');
});

// ============ 错误处理 ============

/**
 * 未捕获的异常
 */
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);

  // 生产环境可以发送错误报告
  if (!IS_DEV) {
    // TODO: 发送错误报告到服务器
    // Sentry.captureException(error);
  }

  // 严重错误时退出应用
  if (!IS_DEV) {
    app.quit();
  }
});

/**
 * 未处理的 Promise 拒绝
 */
process.on('unhandledRejection', (reason) => {
  logger.error('未处理的 Promise 拒绝:', reason);

  // 生产环境可以发送错误报告
  if (!IS_DEV) {
    // TODO: 发送错误报告到服务器
    // Sentry.captureException(reason);
  }
});

/**
 * 进程警告
 */
process.on('warning', (warning) => {
  logger.warn('进程警告:', warning);
});

// ============ 性能监控 ============

if (IS_DEV) {
  // 开发环境监控应用启动时间
  const startTime = Date.now();

  app.on('ready', () => {
    const duration = Date.now() - startTime;
    logger.info(`应用启动耗时: ${duration}ms`);
  });
}

// ============ 导出（用于测试） ============

export { logger };
