import { BaseProvider } from "./BaseProvider";
import { QianfanProvider } from "./QIanfanProvider";
import { OpenAIProvider } from "./OpenAiProvider";
import { DashScopeProvider } from "./DashScopeProvider";
import { createAppError, ErrorCodes } from "../utils/errorHandler";

interface ApiConfig {
  qianfan?: { accessKey?: string; secretKey?: string }
  dashscope?: { apiKey?: string; baseUrl?: string }
  deepseek?: { apiKey?: string; baseUrl?: string }
  openai?: { apiKey?: string; baseUrl?: string }
}

/**
 * 从 localStorage 读取用户设置的 API Keys
 * 包含解码逻辑
 */
function getApiConfig(): ApiConfig {
  try {
    const saved = localStorage.getItem('app-settings')
    if (!saved) {
      return {}
    }

    const settings = JSON.parse(saved)
    if (!settings.apiKeys) {
      return {}
    }

    // 解码 API Keys（与 settings store 中的逻辑一致）
    const decodedApiKeys: ApiConfig = {}
    const providers: Array<keyof ApiConfig> = ['qianfan', 'dashscope', 'deepseek', 'openai']
    
    for (const providerKey of providers) {
      const config = settings.apiKeys[providerKey]
      if (!config) continue
      
      if (providerKey === 'qianfan') {
        decodedApiKeys.qianfan = {
          accessKey: decodeString(config.accessKey || ''),
          secretKey: decodeString(config.secretKey || ''),
        }
      } else {
        decodedApiKeys[providerKey] = {
          apiKey: decodeString(config.apiKey || ''),
          baseUrl: config.baseUrl,
        }
      }
    }

    return decodedApiKeys
  } catch (e) {
    console.error('Failed to parse settings:', e)
    return {}
  }
}

/**
 * 解码字符串（Base64）
 */
function decodeString(str: string): string {
  if (!str) return ''
  try {
    return decodeURIComponent(atob(str))
  } catch (e) {
    console.error('Failed to decode string:', e)
    return str
  }
}

/**
 * 获取配置值，优先使用用户设置，回退到环境变量
 */
function getConfigValue(
  userValue: string | undefined,
  envValue: string | undefined,
  configName: string
): string {
  const value = userValue || envValue
  if (!value) {
    throw createAppError(
      ErrorCodes.INVALID_API_KEY,
      `请在设置中配置 ${configName}`,
      `Missing configuration: ${configName}`
    )
  }
  return value
}

/**
 * Provider 工厂类
 */
export class ProviderFactory {
  private static configCache = new Map<string, any>()
  private static cacheTimeout = 5000 // 5秒缓存

  /**
   * 获取配置（带缓存）
   */
  private static getConfig(provider: string): any {
    const cached = this.configCache.get(provider)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.config
    }

    const apiConfig = getApiConfig()
    const config = apiConfig[provider as keyof ApiConfig]
    
    this.configCache.set(provider, {
      config,
      timestamp: Date.now(),
    })

    return config
  }

  /**
   * 清除配置缓存
   */
  static clearCache() {
    this.configCache.clear()
  }

  /**
   * 创建 Provider 实例
   */
  static create(providerName: string): BaseProvider {
    const apiConfig = this.getConfig(providerName)

    switch (providerName) {
      case 'qianfan': {
        const accessKey = getConfigValue(
          apiConfig?.accessKey,
          process.env.QIANFAN_ACCESS_KEY,
          '百度千帆 Access Key'
        )
        const secretKey = getConfigValue(
          apiConfig?.secretKey,
          process.env.QIANFAN_SECRET_KEY,
          '百度千帆 Secret Key'
        )
        return new QianfanProvider(accessKey, secretKey)
      }

      case 'openai': {
        const apiKey = getConfigValue(
          apiConfig?.apiKey,
          process.env.OPENAI_API_KEY,
          'OpenAI API Key'
        )
        const baseUrl = getConfigValue(
          apiConfig?.baseUrl,
          process.env.OPENAI_BASE_URL,
          'OpenAI Base URL'
        )
        return new OpenAIProvider(apiKey, baseUrl)
      }

      case 'dashscope': {
        const apiKey = getConfigValue(
          apiConfig?.apiKey,
          process.env.DASHSCOPE_API_KEY,
          '阿里灵积 API Key'
        )
        const baseUrl = getConfigValue(
          apiConfig?.baseUrl,
          process.env.DASHSCOPE_BASE_URL,
          '阿里灵积 Base URL'
        )
        return new DashScopeProvider(apiKey, baseUrl)
      }

      case 'deepseek': {
        const apiKey = getConfigValue(
          apiConfig?.apiKey,
          process.env.DEEPSEEK_API_KEY,
          'DeepSeek API Key'
        )
        const baseUrl = getConfigValue(
          apiConfig?.baseUrl,
          process.env.DEEPSEEK_BASE_URL,
          'DeepSeek Base URL'
        )
        return new OpenAIProvider(apiKey, baseUrl)
      }

      default:
        throw createAppError(
          ErrorCodes.UNKNOWN_PROVIDER,
          `不支持的 AI 提供商: ${providerName}`,
          `Unknown provider: ${providerName}`,
          { providerName }
        )
    }
  }
}

/**
 * 创建 Provider（向后兼容）
 */
export function createProvider(providerName: string): BaseProvider {
  return ProviderFactory.create(providerName)
}
