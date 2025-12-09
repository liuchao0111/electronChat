/**
 * 错误处理工具
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export type ErrorLevel = 'info' | 'warning' | 'error' | 'fatal'

export interface ErrorLog {
  timestamp: string
  level: ErrorLevel
  message: string
  code?: string
  context?: Record<string, any>
  stack?: string
}

class ErrorHandler {
  private errors: ErrorLog[] = []
  private maxErrors = 100

  /**
   * 记录错误
   */
  log(
    error: unknown,
    level: ErrorLevel = 'error',
    context?: Record<string, any>
  ): ErrorLog {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      level,
      message: this.extractMessage(error),
      context,
    }

    if (error instanceof AppError) {
      errorLog.code = error.code
      errorLog.context = { ...errorLog.context, ...error.context }
    }

    if (error instanceof Error) {
      errorLog.stack = error.stack
    }

    this.errors.push(errorLog)
    
    // 限制错误日志数量
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    // 控制台输出
    this.consoleLog(errorLog)

    return errorLog
  }

  /**
   * 提取错误消息
   */
  private extractMessage(error: unknown): string {
    if (error instanceof AppError) {
      return error.userMessage
    }
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return '未知错误'
  }

  /**
   * 控制台输出
   */
  private consoleLog(log: ErrorLog) {
    const prefix = `[${log.level.toUpperCase()}] ${log.timestamp}`
    const message = log.code ? `${log.code}: ${log.message}` : log.message

    switch (log.level) {
      case 'fatal':
      case 'error':
        console.error(prefix, message, log.context, log.stack)
        break
      case 'warning':
        console.warn(prefix, message, log.context)
        break
      case 'info':
        console.info(prefix, message, log.context)
        break
    }
  }

  /**
   * 获取所有错误日志
   */
  getErrors(level?: ErrorLevel): ErrorLog[] {
    if (level) {
      return this.errors.filter((e) => e.level === level)
    }
    return [...this.errors]
  }

  /**
   * 清除错误日志
   */
  clearErrors() {
    this.errors = []
  }

  /**
   * 导出错误日志
   */
  exportErrors(): string {
    return JSON.stringify(this.errors, null, 2)
  }
}

// 单例实例
export const errorHandler = new ErrorHandler()

/**
 * 处理错误并显示用户友好的消息
 */
export function handleError(
  error: unknown,
  context: string,
  showAlert = true
): ErrorLog {
  const errorLog = errorHandler.log(error, 'error', { context })

  if (showAlert) {
    const message = error instanceof AppError 
      ? error.userMessage 
      : `操作失败: ${errorLog.message}`
    
    // 这里可以替换为更好的通知组件
    alert(message)
  }

  return errorLog
}

/**
 * 处理异步操作的错误
 */
export async function handleAsyncError<T>(
  fn: () => Promise<T>,
  context: string,
  showAlert = true
): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    handleError(error, context, showAlert)
    return null
  }
}

/**
 * 创建应用错误
 */
export function createAppError(
  code: string,
  userMessage: string,
  technicalMessage?: string,
  context?: Record<string, any>
): AppError {
  return new AppError(
    technicalMessage || userMessage,
    code,
    userMessage,
    context
  )
}

// 预定义的错误代码
export const ErrorCodes = {
  // 设置相关
  SETTINGS_LOAD_FAILED: 'SETTINGS_LOAD_FAILED',
  SETTINGS_SAVE_FAILED: 'SETTINGS_SAVE_FAILED',
  INVALID_API_KEY: 'INVALID_API_KEY',
  INVALID_URL: 'INVALID_URL',
  
  // 提供商相关
  UNKNOWN_PROVIDER: 'UNKNOWN_PROVIDER',
  PROVIDER_AUTH_FAILED: 'PROVIDER_AUTH_FAILED',
  PROVIDER_REQUEST_FAILED: 'PROVIDER_REQUEST_FAILED',
  
  // 数据库相关
  DB_READ_FAILED: 'DB_READ_FAILED',
  DB_WRITE_FAILED: 'DB_WRITE_FAILED',
  
  // 网络相关
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // 文件相关
  FILE_READ_FAILED: 'FILE_READ_FAILED',
  FILE_WRITE_FAILED: 'FILE_WRITE_FAILED',
  IMAGE_UPLOAD_FAILED: 'IMAGE_UPLOAD_FAILED',
} as const
