/**
 * 验证工具函数
 */

export type ProviderType = 'qianfan' | 'dashscope' | 'deepseek' | 'openai'

/**
 * 验证 API Key 格式
 */
export function validateApiKey(key: string, provider: ProviderType): {
  valid: boolean
  error?: string
} {
  if (!key || key.trim() === '') {
    return { valid: true } // 空值允许
  }

  const patterns: Record<ProviderType, { pattern: RegExp; example: string }> = {
    openai: {
      pattern: /^sk-[a-zA-Z0-9-_]{20,}$/,
      example: 'sk-proj-xxxxxxxxxxxxxxxx',
    },
    deepseek: {
      pattern: /^sk-[a-zA-Z0-9]{20,}$/,
      example: 'sk-xxxxxxxxxxxxxxxx',
    },
    dashscope: {
      pattern: /^sk-[a-zA-Z0-9]{20,}$/,
      example: 'sk-xxxxxxxxxxxxxxxx',
    },
    qianfan: {
      pattern: /^[a-zA-Z0-9]{20,}$/,
      example: 'ALTAKxxxxxxxxxxx',
    },
  }

  const config = patterns[provider]
  if (!config) {
    return { valid: false, error: '未知的提供商' }
  }

  if (!config.pattern.test(key)) {
    return {
      valid: false,
      error: `API Key 格式不正确，应类似于: ${config.example}`,
    }
  }

  return { valid: true }
}

/**
 * 验证 URL 格式
 */
export function validateUrl(url: string): {
  valid: boolean
  error?: string
} {
  if (!url || url.trim() === '') {
    return { valid: false, error: 'URL 不能为空' }
  }

  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL 必须使用 http 或 https 协议' }
    }
    return { valid: true }
  } catch {
    return { valid: false, error: 'URL 格式不正确' }
  }
}

/**
 * 验证百度千帆配置
 */
export function validateQianfanConfig(config: {
  accessKey: string
  secretKey: string
}): { valid: boolean; error?: string } {
  if (!config.accessKey || !config.secretKey) {
    return { valid: false, error: 'Access Key 和 Secret Key 都不能为空' }
  }

  const accessKeyResult = validateApiKey(config.accessKey, 'qianfan')
  if (!accessKeyResult.valid) {
    return { valid: false, error: `Access Key ${accessKeyResult.error}` }
  }

  const secretKeyResult = validateApiKey(config.secretKey, 'qianfan')
  if (!secretKeyResult.valid) {
    return { valid: false, error: `Secret Key ${secretKeyResult.error}` }
  }

  return { valid: true }
}

/**
 * 验证通用 API 配置
 */
export function validateApiConfig(
  config: { apiKey: string; baseUrl: string },
  provider: ProviderType
): { valid: boolean; error?: string } {
  if (!config.apiKey) {
    return { valid: false, error: 'API Key 不能为空' }
  }

  const keyResult = validateApiKey(config.apiKey, provider)
  if (!keyResult.valid) {
    return keyResult
  }

  const urlResult = validateUrl(config.baseUrl)
  if (!urlResult.valid) {
    return { valid: false, error: `Base URL ${urlResult.error}` }
  }

  return { valid: true }
}

/**
 * 清理和标准化 URL
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim()
  
  // 移除末尾的斜杠
  if (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  
  return normalized
}

/**
 * 掩码显示敏感信息
 */
export function maskSensitiveData(data: string, visibleChars = 4): string {
  if (!data || data.length <= visibleChars * 2) {
    return '****'
  }
  
  const start = data.slice(0, visibleChars)
  const end = data.slice(-visibleChars)
  const masked = '*'.repeat(Math.min(data.length - visibleChars * 2, 20))
  
  return `${start}${masked}${end}`
}
