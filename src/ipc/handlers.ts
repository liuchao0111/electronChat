/**
 * IPC 事件处理器
 * 集中管理所有主进程与渲染进程之间的通信
 */

import { ipcMain, BrowserWindow, Menu } from 'electron';
import { app } from 'electron';
import path from 'node:path';
import fs from 'fs/promises';
import { CreateChatProps } from '../types';
import { createProvider } from '../providers/createProvider';

// ============ 类型定义 ============

type Language = 'zh-CN' | 'en-US';

interface ImageFileData {
  buffer: ArrayBuffer;
  fileName: string;
}

// ============ 全局状态 ============

let currentLanguage: Language = 'zh-CN';

// ============ 工具函数 ============

/**
 * 日志工具
 */
const logger = {
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[IPC-INFO]', ...args);
    }
  },
  error: (...args: any[]) => {
    console.error('[IPC-ERROR]', ...args);
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[IPC-WARN]', ...args);
    }
  },
};

/**
 * 验证文件数据
 */
const validateImageFileData = (fileData: any): fileData is ImageFileData => {
  if (!fileData) {
    throw new Error('文件数据为空');
  }
  if (!fileData.buffer || !(fileData.buffer instanceof ArrayBuffer)) {
    throw new Error('文件 buffer 无效');
  }
  if (!fileData.fileName || typeof fileData.fileName !== 'string') {
    throw new Error('文件名无效');
  }
  return true;
}

/**
 * 生成唯一文件名
 */
const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  return `${timestamp}_${random}_${name}${ext}`;
}

/**
 * 获取主窗口
 */
const getMainWindow = (): BrowserWindow | null => {
  const windows = BrowserWindow.getAllWindows();
  return windows.length > 0 ? windows[0] : null;
}

// ============ IPC 处理器 ============

/**
 * 图片复制处理器
 * 将图片从临时位置复制到用户数据目录
 */
export function registerImageCopyHandler() {
  // 移除旧处理器
  if (ipcMain.listenerCount('copy-image-to-user-dir') > 0) {
    ipcMain.removeHandler('copy-image-to-user-dir');
  }

  ipcMain.handle('copy-image-to-user-dir', async (_event, fileData: unknown) => {
    try {
      // 验证数据
      validateImageFileData(fileData);
      const validFileData = fileData as ImageFileData;

      logger.info('接收到图片文件:', {
        fileName: validFileData.fileName,
        size: `${(validFileData.buffer.byteLength / 1024).toFixed(2)} KB`,
      });

      // 创建图片目录
      const userDataPath = app.getPath('userData');
      const imagesDir = path.join(userDataPath, 'images');
      await fs.mkdir(imagesDir, { recursive: true });

      // 生成唯一文件名并保存
      const uniqueFileName = generateUniqueFileName(validFileData.fileName);
      const destPath = path.join(imagesDir, uniqueFileName);
      await fs.writeFile(destPath, Buffer.from(validFileData.buffer));

      logger.info('图片保存成功:', destPath);
      return destPath;
    } catch (error) {
      logger.error('保存图片失败:', error);
      throw error;
    }
  });

  logger.info('图片复制处理器已注册');
}

/**
 * 聊天处理器
 * 处理与 AI 提供商的流式对话
 */
export function registerChatHandler() {
  // 移除旧监听器
  ipcMain.removeAllListeners('start-chat');

  ipcMain.on('start-chat', async (_event, data: CreateChatProps) => {
    const mainWindow = getMainWindow();

    try {
      // 验证数据
      if (!data) {
        throw new Error('聊天数据为空');
      }

      const { messageId, providerName, selectedModel, messages } = data;

      if (!messages || !Array.isArray(messages)) {
        throw new Error('消息列表无效');
      }

      logger.info('开始聊天:', {
        providerName,
        selectedModel,
        messageCount: messages.length,
      });

      // 创建 Provider 并开始流式响应
      const provider = createProvider(providerName);
      const stream = await provider.chat(messages, selectedModel);

      // 流式发送消息更新
      for await (const chunk of stream) {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('update-message', {
            messageId,
            data: chunk,
          });
        } else {
          logger.warn('主窗口已销毁，停止发送消息');
          break;
        }
      }

      logger.info('聊天完成:', { messageId });
    } catch (error) {
      logger.error('聊天失败:', error);

      // 发送错误到渲染进程
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('chat-error', {
          error: error instanceof Error ? error.message : '未知错误',
        });
      }
    }
  });

  logger.info('聊天处理器已注册');
}

/**
 * 语言切换处理器
 * 更新应用菜单语言
 */
export function registerLanguageHandler(updateMenuLanguage: (lang: Language) => void) {
  ipcMain.removeAllListeners('update-menu-language');

  ipcMain.on('update-menu-language', (_event, language: Language) => {
    logger.info('切换语言:', language);
    currentLanguage = language;
    updateMenuLanguage(language);
  });

  logger.info('语言切换处理器已注册');
}

/**
 * 右键菜单处理器
 * 显示对话列表的上下文菜单
 */
export function registerContextMenuHandler() {
  const contextMenuTexts = {
    'zh-CN': {
      delete: '删除对话',
    },
    'en-US': {
      delete: 'Delete Conversation',
    },
  };

  ipcMain.removeAllListeners('show-conversation-context-menu');

  ipcMain.on('show-conversation-context-menu', (event, conversationId: number) => {
    const texts = contextMenuTexts[currentLanguage];

    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: texts.delete,
        click: () => {
          event.sender.send('context-menu-delete', conversationId);
        },
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    const window = BrowserWindow.fromWebContents(event.sender);

    if (window) {
      menu.popup({ window });
    } else {
      logger.warn('无法找到窗口，无法显示右键菜单');
    }
  });

  logger.info('右键菜单处理器已注册');
}

/**
 * 注册所有 IPC 处理器
 */
export function registerAllIPCHandlers(updateMenuLanguage: (lang: Language) => void) {
  logger.info('开始注册 IPC 处理器...');

  registerImageCopyHandler();
  registerChatHandler();
  registerLanguageHandler(updateMenuLanguage);
  registerContextMenuHandler();

  logger.info('所有 IPC 处理器注册完成');
}

/**
 * 清理所有 IPC 处理器
 */
export function cleanupIPCHandlers() {
  logger.info('清理 IPC 处理器...');

  ipcMain.removeHandler('copy-image-to-user-dir');
  ipcMain.removeAllListeners('start-chat');
  ipcMain.removeAllListeners('update-menu-language');
  ipcMain.removeAllListeners('show-conversation-context-menu');

  logger.info('IPC 处理器清理完成');
}

/**
 * 获取当前语言
 */
export function getCurrentLanguage(): Language {
  return currentLanguage;
}

/**
 * 设置当前语言
 */
export function setCurrentLanguage(language: Language) {
  currentLanguage = language;
}
