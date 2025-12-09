/**
 * 自定义协议处理器
 * 处理应用内的自定义协议请求
 */

import { protocol } from 'electron';
import fs from 'fs/promises';
import { lookup } from 'mime-types';

// ============ 工具函数 ============

/**
 * 日志工具
 */
const logger = {
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[PROTOCOL-INFO]', ...args);
    }
  },
  error: (...args: any[]) => {
    console.error('[PROTOCOL-ERROR]', ...args);
  },
};

// ============ 协议处理器 ============

/**
 * 注册 safe-file 协议
 * 用于安全地访问本地文件
 */
export function registerSafeFileProtocol() {
  protocol.handle('safe-file', async (request) => {
    try {
      // 解析文件路径
      const filePath = decodeURIComponent(request.url.slice('safe-file://'.length));
      logger.info('safe-file 请求:', filePath);

      // 读取文件
      const data = await fs.readFile(filePath);
      const mimeType = lookup(filePath) || 'application/octet-stream';

      logger.info('文件读取成功:', { filePath, mimeType, size: data.length });

      // 返回响应
      return new Response(data, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000', // 缓存一年
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      logger.error('safe-file 协议处理失败:', error);

      return new Response('File not found', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  });

  logger.info('safe-file 协议已注册');
}

/**
 * 注册所有自定义协议
 */
export function registerAllProtocols() {
  logger.info('开始注册自定义协议...');

  registerSafeFileProtocol();

  logger.info('所有自定义协议注册完成');
}

/**
 * 清理协议处理器
 */
export function cleanupProtocols() {
  logger.info('清理协议处理器...');

  // Electron 会在应用退出时自动清理协议
  // 这里可以添加额外的清理逻辑

  logger.info('协议处理器清理完成');
}
