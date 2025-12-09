/**
 * 窗口管理器
 * 负责创建、管理和销毁应用窗口
 */

import { BrowserWindow } from 'electron';
import path from 'node:path';

// ============ 类型定义 ============

interface WindowConfig {
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  title?: string;
}

// ============ 全局状态 ============

let mainWindow: BrowserWindow | null = null;

// ============ 工具函数 ============

/**
 * 日志工具
 */
const logger = {
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[WINDOW-INFO]', ...args);
    }
  },
  error: (...args: any[]) => {
    console.error('[WINDOW-ERROR]', ...args);
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[WINDOW-WARN]', ...args);
    }
  },
};

/**
 * 检查是否为开发环境
 */
const isDevelopment = (): boolean => {
  return !!process.env.VITE_DEV_SERVER_URL || process.env.NODE_ENV === 'development';
}

// ============ 窗口管理 ============

/**
 * 创建主窗口
 */
export async function createMainWindow(config: WindowConfig = {}): Promise<BrowserWindow> {
  logger.info('创建主窗口...');

  const {
    width = 1200,
    height = 800,
    minWidth = 800,
    minHeight = 600,
    title = 'VChat',
  } = config;

  const window = new BrowserWindow({
    width,
    height,
    minWidth,
    minHeight,
    title,
    show: false, // 先隐藏，加载完成后再显示
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDevelopment(), // 生产环境禁用 DevTools
      sandbox: true, // 启用沙箱模式（更安全）
    },
  });

  // 窗口加载完成后显示（避免白屏闪烁）
  window.once('ready-to-show', () => {
    window.show();
    logger.info('窗口已显示');
  });

  // 加载页面
  try {
    if (isDevelopment() && process.env.VITE_DEV_SERVER_URL) {
      await window.loadURL(process.env.VITE_DEV_SERVER_URL);
      window.webContents.openDevTools();
      logger.info('开发模式: DevTools 已打开');
    } else {
      // 生产环境
      const indexPath = path.join(__dirname, '../renderer/main_window/index.html');
      await window.loadFile(indexPath);
      logger.info('生产模式: 已加载本地文件');
    }
  } catch (error) {
    logger.error('加载页面失败:', error);
    throw error;
  }

  // 保存窗口引用
  mainWindow = window;

  // 窗口关闭时清理引用
  window.on('closed', () => {
    mainWindow = null;
    logger.info('窗口已关闭');
  });

  // 窗口错误处理
  window.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    logger.error('页面加载失败:', { errorCode, errorDescription });
  });

  // 窗口崩溃处理
  window.webContents.on('render-process-gone', (event, details) => {
    logger.error('渲染进程崩溃:', details);
  });

  logger.info('主窗口创建完成');
  return window;
}

/**
 * 获取主窗口
 */
export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

/**
 * 获取或创建主窗口
 */
export async function getOrCreateMainWindow(config?: WindowConfig): Promise<BrowserWindow> {
  if (mainWindow && !mainWindow.isDestroyed()) {
    logger.info('返回现有主窗口');
    return mainWindow;
  }

  logger.info('主窗口不存在，创建新窗口');
  return createMainWindow(config);
}

/**
 * 关闭主窗口
 */
export function closeMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    logger.info('关闭主窗口');
    mainWindow.close();
    mainWindow = null;
  }
}

/**
 * 最小化主窗口
 */
export function minimizeMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
  }
}

/**
 * 最大化/还原主窗口
 */
export function toggleMaximizeMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
}

/**
 * 显示主窗口
 */
export function showMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
  }
}

/**
 * 隐藏主窗口
 */
export function hideMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
  }
}

/**
 * 获取所有窗口
 */
export function getAllWindows(): BrowserWindow[] {
  return BrowserWindow.getAllWindows();
}

/**
 * 关闭所有窗口
 */
export function closeAllWindows() {
  logger.info('关闭所有窗口');
  const windows = BrowserWindow.getAllWindows();
  windows.forEach(window => {
    if (!window.isDestroyed()) {
      window.close();
    }
  });
  mainWindow = null;
}

/**
 * 清理窗口管理器
 */
export function cleanupWindowManager() {
  logger.info('清理窗口管理器');
  closeAllWindows();
}
