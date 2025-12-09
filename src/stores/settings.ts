import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ============ 类型定义 ============
export type FontSize = 'small' | 'medium' | 'large'
export type Theme = 'light' | 'dark' | 'auto'
export type Language = 'zh-CN' | 'en-US'

export interface ApiKeyConfig {
  qianfan: { accessKey: string; secretKey: string }
  dashscope: { apiKey: string; baseUrl: string }
  deepseek: { apiKey: string; baseUrl: string }
  openai: { apiKey: string; baseUrl: string }
}

export interface SettingsState {
  fontSize: FontSize
  theme: Theme
  language: Language
  apiKeys: ApiKeyConfig
}

// ============ 常量定义 ============
const STORAGE_KEY = 'app-settings'
const STORAGE_VERSION = '1.0'

const DEFAULT_SETTINGS: SettingsState = {
  fontSize: 'medium',
  theme: 'auto',
  language: 'zh-CN',
  apiKeys: {
    qianfan: { accessKey: '', secretKey: '' },
    dashscope: { 
      apiKey: '', 
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1' 
    },
    deepseek: { 
      apiKey: '', 
      baseUrl: 'https://api.deepseek.com' 
    },
    openai: { 
      apiKey: '', 
      baseUrl: 'https://api.openai.com/v1' 
    },
  },
}

// ============ 工具函数 ============

/**
 * 简单的字符串编码（Base64）
 * 注意：这不是真正的加密，只是混淆。生产环境应使用 Electron 的 safeStorage
 */
const encodeString = (str: string): string => {
  if (!str) return ''
  try {
    return btoa(encodeURIComponent(str))
  } catch (e) {
    console.error('Failed to encode string:', e)
    return str
  }
}

const decodeString = (str: string): string => {
  if (!str) return ''
  try {
    return decodeURIComponent(atob(str))
  } catch (e) {
    console.error('Failed to decode string:', e)
    return str
  }
}

// 导入验证工具
import { 
  validateApiKey as validateKey, 
  validateUrl as validateUrlFormat,
  validateQianfanConfig,
  validateApiConfig,
  normalizeUrl,
  type ProviderType
} from '../utils/validation'

/**
 * 深度合并对象
 */
const deepMerge = <T>(target: T, source: Partial<T>): T => {
  const result = { ...target }
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {} as any, source[key] as any)
    } else if (source[key] !== undefined) {
      result[key] = source[key] as any
    }
  }
  return result
}

// ============ Store 定义 ============

export const useSettingsStore = defineStore('settings', () => {
  // ============ State ============
  const settings = ref<SettingsState>(loadSettings())
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ============ Getters ============
  const hasApiKey = computed(() => (provider: keyof ApiKeyConfig) => {
    const config = settings.value.apiKeys[provider]
    if (provider === 'qianfan') {
      const qianfanConfig = config as { accessKey: string; secretKey: string }
      return !!(qianfanConfig.accessKey && qianfanConfig.secretKey)
    }
    const otherConfig = config as { apiKey: string; baseUrl: string }
    return !!otherConfig.apiKey
  })

  const isConfigured = computed(() => {
    return Object.keys(settings.value.apiKeys).some(
      provider => hasApiKey.value(provider as keyof ApiKeyConfig)
    )
  })

  // ============ Actions ============

  /**
   * 从 localStorage 加载设置
   */
  function loadSettings(): SettingsState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) {
        return { ...DEFAULT_SETTINGS }
      }

      const parsed = JSON.parse(saved)
      
      // 版本检查（未来可能需要迁移）
      if (parsed.version !== STORAGE_VERSION) {
        console.warn('Settings version mismatch, using defaults')
        return { ...DEFAULT_SETTINGS }
      }

      // 解码 API Keys
      const decodedApiKeys: ApiKeyConfig = {
        qianfan: { accessKey: '', secretKey: '' },
        dashscope: { apiKey: '', baseUrl: '' },
        deepseek: { apiKey: '', baseUrl: '' },
        openai: { apiKey: '', baseUrl: '' },
      }
      
      for (const providerKey in parsed.apiKeys) {
        const provider = providerKey as keyof ApiKeyConfig
        const config = parsed.apiKeys[provider]
        if (provider === 'qianfan') {
          decodedApiKeys.qianfan = {
            accessKey: decodeString(config.accessKey || ''),
            secretKey: decodeString(config.secretKey || ''),
          }
        } else {
          const defaultConfig = DEFAULT_SETTINGS.apiKeys[provider] as { apiKey: string; baseUrl: string }
          decodedApiKeys[provider] = {
            apiKey: decodeString(config.apiKey || ''),
            baseUrl: config.baseUrl || defaultConfig.baseUrl,
          }
        }
      }

      return deepMerge(DEFAULT_SETTINGS, {
        ...parsed,
        apiKeys: decodedApiKeys,
      })
    } catch (e) {
      console.error('Failed to load settings:', e)
      error.value = '加载设置失败'
      return { ...DEFAULT_SETTINGS }
    }
  }

  /**
   * 保存设置到 localStorage
   */
  function saveSettings(): boolean {
    try {
      loading.value = true
      error.value = null

      // 编码 API Keys
      const encodedApiKeys: Record<string, any> = {}
      const providers: Array<keyof ApiKeyConfig> = ['qianfan', 'dashscope', 'deepseek', 'openai']
      
      for (const provider of providers) {
        const config = settings.value.apiKeys[provider]
        if (provider === 'qianfan') {
          const qianfanConfig = config as { accessKey: string; secretKey: string }
          encodedApiKeys[provider] = {
            accessKey: encodeString(qianfanConfig.accessKey || ''),
            secretKey: encodeString(qianfanConfig.secretKey || ''),
          }
        } else {
          const otherConfig = config as { apiKey: string; baseUrl: string }
          encodedApiKeys[provider] = {
            apiKey: encodeString(otherConfig.apiKey || ''),
            baseUrl: otherConfig.baseUrl,
          }
        }
      }

      const toSave = {
        version: STORAGE_VERSION,
        ...settings.value,
        apiKeys: encodedApiKeys,
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
      return true
    } catch (e) {
      console.error('Failed to save settings:', e)
      error.value = '保存设置失败'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新字体大小
   */
  function updateFontSize(size: FontSize): boolean {
    settings.value = {
      ...settings.value,
      fontSize: size
    }
    return saveSettings()
  }

  /**
   * 更新主题
   */
  function updateTheme(theme: Theme): boolean {
    settings.value = {
      ...settings.value,
      theme: theme
    }
    return saveSettings()
  }

  /**
   * 更新语言
   */
  function updateLanguage(language: Language): boolean {
    settings.value = {
      ...settings.value,
      language: language
    }
    return saveSettings()
  }

  /**
   * 更新 API Key 配置（带验证）
   */
  function updateApiKey(
    provider: keyof ApiKeyConfig,
    config: Partial<ApiKeyConfig[keyof ApiKeyConfig]>
  ): { success: boolean; error?: string } {
    try {
      // 验证输入
      if (provider === 'qianfan') {
        const qianfanConfig = config as Partial<ApiKeyConfig['qianfan']>
        const fullConfig = {
          accessKey: qianfanConfig.accessKey || settings.value.apiKeys.qianfan.accessKey,
          secretKey: qianfanConfig.secretKey || settings.value.apiKeys.qianfan.secretKey,
        }
        
        // 只有当两个都有值时才验证
        if (fullConfig.accessKey && fullConfig.secretKey) {
          const validation = validateQianfanConfig(fullConfig)
          if (!validation.valid) {
            return { success: false, error: validation.error }
          }
        }
      } else {
        const otherConfig = config as Partial<ApiKeyConfig['openai']>
        const currentConfig = settings.value.apiKeys[provider] as { apiKey: string; baseUrl: string }
        const fullConfig = {
          apiKey: otherConfig.apiKey || currentConfig.apiKey,
          baseUrl: otherConfig.baseUrl || currentConfig.baseUrl,
        }
        
        // 只有当 API Key 有值时才验证
        if (fullConfig.apiKey) {
          const validation = validateApiConfig(fullConfig, provider as ProviderType)
          if (!validation.valid) {
            return { success: false, error: validation.error }
          }
          
          // 标准化 URL
          if (otherConfig.baseUrl) {
            otherConfig.baseUrl = normalizeUrl(otherConfig.baseUrl)
          }
        }
      }

      // 更新配置
      settings.value.apiKeys[provider] = {
        ...settings.value.apiKeys[provider],
        ...config,
      } as any

      const saved = saveSettings()
      return { 
        success: saved, 
        error: saved ? undefined : '保存失败' 
      }
    } catch (e) {
      console.error('Failed to update API key:', e)
      return { success: false, error: '更新失败' }
    }
  }

  /**
   * 重置所有设置
   */
  function resetSettings(): boolean {
    try {
      settings.value = { ...DEFAULT_SETTINGS }
      return saveSettings()
    } catch (e) {
      console.error('Failed to reset settings:', e)
      error.value = '重置设置失败'
      return false
    }
  }

  /**
   * 导出设置（用于备份）
   */
  function exportSettings(): string {
    return JSON.stringify(settings.value, null, 2)
  }

  /**
   * 导入设置（用于恢复）
   */
  function importSettings(jsonString: string): { success: boolean; error?: string } {
    try {
      const imported = JSON.parse(jsonString)
      settings.value = deepMerge(DEFAULT_SETTINGS, imported)
      const saved = saveSettings()
      return { 
        success: saved, 
        error: saved ? undefined : '保存失败' 
      }
    } catch (e) {
      console.error('Failed to import settings:', e)
      return { success: false, error: '导入失败：格式不正确' }
    }
  }

  /**
   * 清除错误状态
   */
  function clearError() {
    error.value = null
  }

  // ============ 返回 ============
  return {
    // State
    settings,
    loading,
    error,
    
    // Getters
    hasApiKey,
    isConfigured,
    
    // Actions
    updateFontSize,
    updateTheme,
    updateLanguage,
    updateApiKey,
    resetSettings,
    exportSettings,
    importSettings,
    clearError,
  }
})
