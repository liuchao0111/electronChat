<template>
  <div 
    class="w-full h-full overflow-y-auto p-8" 
    :class="[
      fontSizeClass,
      settingsStore.settings.theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-white text-gray-900'
    ]"
  >
    <div class="max-w-5xl mx-auto">
      <!-- 标签页 -->
      <div class="flex gap-8 border-b border-gray-200 mb-8">
        <button
          @click="activeTab = 'general'"
          :class="[
            'pb-3 px-1 text-base font-medium transition-colors relative',
            activeTab === 'general'
              ? 'text-green-600'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          General
          <div
            v-if="activeTab === 'general'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
          ></div>
        </button>
        <button
          @click="activeTab = 'models'"
          :class="[
            'pb-3 px-1 text-base font-medium transition-colors relative',
            activeTab === 'models'
              ? 'text-green-600'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          Models
          <div
            v-if="activeTab === 'models'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
          ></div>
        </button>
      </div>

      <!-- General 标签页内容 -->
      <div v-if="activeTab === 'general'" class="space-y-6">
        <!-- 外观设置 -->
        <div class="space-y-4">
          <h2 class="text-lg font-semibold">外观设置</h2>
          
          <!-- 字体大小 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              字体大小
            </label>
            <div class="flex gap-3">
              <button
                v-for="size in fontSizes"
                :key="size.value"
                @click="settingsStore.updateFontSize(size.value)"
                :class="[
                  'px-4 py-2 rounded-md border transition-colors',
                  settingsStore.settings.fontSize === size.value
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-600'
                ]"
              >
                {{ size.label }}
              </button>
            </div>
          </div>

          <!-- 主题 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              主题
            </label>
            <div class="flex gap-3">
              <button
                v-for="theme in themes"
                :key="theme.value"
                @click="settingsStore.updateTheme(theme.value)"
                :class="[
                  'px-4 py-2 rounded-md border transition-colors',
                  settingsStore.settings.theme === theme.value
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-600'
                ]"
              >
                {{ theme.label }}
              </button>
            </div>
          </div>

          <!-- 语言 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              语言
            </label>
            <div class="flex gap-3">
              <button
                v-for="lang in languages"
                :key="lang.value"
                @click="changeLanguage(lang.value)"
                :class="[
                  'px-4 py-2 rounded-md border transition-colors',
                  settingsStore.settings.language === lang.value
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-600'
                ]"
              >
                {{ lang.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Models 标签页内容 -->
      <div v-if="activeTab === 'models'" class="space-y-4">
        <!-- 百度千帆 -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <button
            @click="toggleProvider('qianfan')"
            class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded flex items-center justify-center bg-blue-100">
                <span class="text-blue-600 font-bold text-sm">百</span>
              </div>
              <span class="font-medium text-gray-900">百度千帆</span>
            </div>
            <Icon
              :icon="expandedProviders.qianfan ? 'mdi:chevron-up' : 'mdi:chevron-down'"
              class="w-5 h-5 text-gray-400"
            />
          </button>
          <div v-if="expandedProviders.qianfan" class="p-4 bg-gray-50 border-t border-gray-200">
            <div class="space-y-3">
              <div>
                <label class="block text-sm text-gray-600 mb-1">Access Key</label>
                <input
                  v-model="apiConfigs.qianfan.accessKey"
                  @blur="validateField('qianfan', 'accessKey', apiConfigs.qianfan.accessKey)"
                  type="password"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    validationErrors['qianfan.accessKey']
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-green-500'
                  ]"
                  placeholder="ALTAKxxxxxxxxxxx"
                />
                <p v-if="validationErrors['qianfan.accessKey']" class="mt-1 text-xs text-red-600">
                  {{ validationErrors['qianfan.accessKey'] }}
                </p>
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">Secret Key</label>
                <input
                  v-model="apiConfigs.qianfan.secretKey"
                  @blur="validateField('qianfan', 'secretKey', apiConfigs.qianfan.secretKey)"
                  type="password"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    validationErrors['qianfan.secretKey']
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-green-500'
                  ]"
                  placeholder="0ad82210xxxxxxxxxxx"
                />
                <p v-if="validationErrors['qianfan.secretKey']" class="mt-1 text-xs text-red-600">
                  {{ validationErrors['qianfan.secretKey'] }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 阿里灵积 -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <button
            @click="toggleProvider('dashscope')"
            class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded flex items-center justify-center bg-orange-100">
                <span class="text-orange-600 font-bold text-sm">通</span>
              </div>
              <span class="font-medium text-gray-900">阿里灵积</span>
            </div>
            <Icon
              :icon="expandedProviders.dashscope ? 'mdi:chevron-up' : 'mdi:chevron-down'"
              class="w-5 h-5 text-gray-400"
            />
          </button>
          <div v-if="expandedProviders.dashscope" class="p-4 bg-gray-50 border-t border-gray-200">
            <div class="space-y-3">
              <div>
                <label class="block text-sm text-gray-600 mb-1">API Key</label>
                <input
                  v-model="apiConfigs.dashscope.apiKey"
                  @blur="validateField('dashscope', 'apiKey', apiConfigs.dashscope.apiKey)"
                  type="password"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    validationErrors['dashscope.apiKey']
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-green-500'
                  ]"
                  placeholder="sk-xxxxxxxxxxxxxxxx"
                />
                <p v-if="validationErrors['dashscope.apiKey']" class="mt-1 text-xs text-red-600">
                  {{ validationErrors['dashscope.apiKey'] }}
                </p>
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">Base URL</label>
                <input
                  v-model="apiConfigs.dashscope.baseUrl"
                  @blur="validateField('dashscope', 'baseUrl', apiConfigs.dashscope.baseUrl)"
                  type="text"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    validationErrors['dashscope.baseUrl']
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-green-500'
                  ]"
                />
                <p v-if="validationErrors['dashscope.baseUrl']" class="mt-1 text-xs text-red-600">
                  {{ validationErrors['dashscope.baseUrl'] }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- DeepSeek -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <button
            @click="toggleProvider('deepseek')"
            class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded flex items-center justify-center bg-gray-800">
                <span class="text-white font-bold text-xs">DS</span>
              </div>
              <span class="font-medium text-gray-900">DeepSeek</span>
            </div>
            <Icon
              :icon="expandedProviders.deepseek ? 'mdi:chevron-up' : 'mdi:chevron-down'"
              class="w-5 h-5 text-gray-400"
            />
          </button>
          <div v-if="expandedProviders.deepseek" class="p-4 bg-gray-50 border-t border-gray-200">
            <div class="space-y-3">
              <div>
                <label class="block text-sm text-gray-600 mb-1">API Key</label>
                <input
                  v-model="apiConfigs.deepseek.apiKey"
                  @blur="validateField('deepseek', 'apiKey', apiConfigs.deepseek.apiKey)"
                  type="password"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    validationErrors['deepseek.apiKey']
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-green-500'
                  ]"
                  placeholder="sk-xxxxxxxxxxxxxxxx"
                />
                <p v-if="validationErrors['deepseek.apiKey']" class="mt-1 text-xs text-red-600">
                  {{ validationErrors['deepseek.apiKey'] }}
                </p>
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">Base URL</label>
                <input
                  v-model="apiConfigs.deepseek.baseUrl"
                  @blur="validateField('deepseek', 'baseUrl', apiConfigs.deepseek.baseUrl)"
                  type="text"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    validationErrors['deepseek.baseUrl']
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-green-500'
                  ]"
                />
                <p v-if="validationErrors['deepseek.baseUrl']" class="mt-1 text-xs text-red-600">
                  {{ validationErrors['deepseek.baseUrl'] }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- OpenAI -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <button
            @click="toggleProvider('openai')"
            class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded flex items-center justify-center bg-green-100">
                <span class="text-green-600 font-bold text-xs">AI</span>
              </div>
              <span class="font-medium text-gray-900">OpenAI</span>
            </div>
            <Icon
              :icon="expandedProviders.openai ? 'mdi:chevron-up' : 'mdi:chevron-down'"
              class="w-5 h-5 text-gray-400"
            />
          </button>
          <div v-if="expandedProviders.openai" class="p-4 bg-gray-50 border-t border-gray-200">
            <div class="space-y-3">
              <div>
                <label class="block text-sm text-gray-600 mb-1">API Key</label>
                <input
                  v-model="apiConfigs.openai.apiKey"
                  @blur="validateField('openai', 'apiKey', apiConfigs.openai.apiKey)"
                  type="password"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    validationErrors['openai.apiKey']
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-green-500'
                  ]"
                  placeholder="sk-proj-xxxxxxxxxxxxxxxx"
                />
                <p v-if="validationErrors['openai.apiKey']" class="mt-1 text-xs text-red-600">
                  {{ validationErrors['openai.apiKey'] }}
                </p>
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">Base URL</label>
                <input
                  v-model="apiConfigs.openai.baseUrl"
                  @blur="validateField('openai', 'baseUrl', apiConfigs.openai.baseUrl)"
                  type="text"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    validationErrors['openai.baseUrl']
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-green-500'
                  ]"
                />
                <p v-if="validationErrors['openai.baseUrl']" class="mt-1 text-xs text-red-600">
                  {{ validationErrors['openai.baseUrl'] }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 错误提示 -->
        <Transition name="fade">
          <div
            v-if="saveError"
            class="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2"
          >
            <Icon icon="mdi:alert-circle" class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-sm text-red-800">{{ saveError }}</p>
            </div>
            <button
              @click="saveError = null"
              class="text-red-600 hover:text-red-800"
            >
              <Icon icon="mdi:close" class="w-5 h-5" />
            </button>
          </div>
        </Transition>

        <!-- 操作按钮 -->
        <div class="flex gap-3 justify-end pt-4">
          <button
            @click="resetSettings"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            重置
          </button>
          <button
            @click="saveApiConfigs"
            :disabled="Object.keys(validationErrors).length > 0"
            :class="[
              'px-4 py-2 text-white rounded-md transition-colors',
              Object.keys(validationErrors).length > 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            ]"
          >
            保存
          </button>
        </div>
      </div>

      <!-- 保存成功提示 -->
      <Transition name="fade">
        <div
          v-if="showSavedMessage"
          class="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
        >
          <Icon icon="mdi:check-circle" class="w-5 h-5" />
          <span>保存成功</span>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore, type FontSize, type Theme, type Language } from '../stores/settings'
import { validateApiKey, validateUrl, type ProviderType } from '../utils/validation'

const settingsStore = useSettingsStore()
const activeTab = ref<'general' | 'models'>('general')
const showSavedMessage = ref(false)
const saveError = ref<string | null>(null)

const expandedProviders = reactive({
  qianfan: false,
  dashscope: false,
  deepseek: false,
  openai: false,
})

const apiConfigs = ref({
  qianfan: { ...settingsStore.settings.apiKeys.qianfan },
  dashscope: { ...settingsStore.settings.apiKeys.dashscope },
  deepseek: { ...settingsStore.settings.apiKeys.deepseek },
  openai: { ...settingsStore.settings.apiKeys.openai },
})

// 验证状态
const validationErrors = reactive<Record<string, string>>({})

// 实时验证
const validateField = (provider: string, field: string, value: string) => {
  const key = `${provider}.${field}`
  
  if (!value) {
    delete validationErrors[key]
    return
  }
  
  if (field === 'baseUrl') {
    const result = validateUrl(value)
    if (!result.valid) {
      validationErrors[key] = result.error || '格式不正确'
    } else {
      delete validationErrors[key]
    }
  } else {
    const result = validateApiKey(value, provider as ProviderType)
    if (!result.valid) {
      validationErrors[key] = result.error || '格式不正确'
    } else {
      delete validationErrors[key]
    }
  }
}

const fontSizes = computed(() => [
  { value: 'small' as FontSize, label: '小' },
  { value: 'medium' as FontSize, label: '中' },
  { value: 'large' as FontSize, label: '大' },
])

const themes = computed(() => [
  { value: 'light' as Theme, label: '浅色' },
  { value: 'dark' as Theme, label: '深色' },
  { value: 'auto' as Theme, label: '跟随系统' },
])

const languages = computed(() => [
  { value: 'zh-CN' as Language, label: '简体中文' },
  { value: 'en-US' as Language, label: 'English' },
])

const fontSizeClass = computed(() => {
  const sizeMap = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  }
  return sizeMap[settingsStore.settings.fontSize]
})

const toggleProvider = (provider: keyof typeof expandedProviders) => {
  expandedProviders[provider] = !expandedProviders[provider]
}

const changeLanguage = (lang: Language) => {
  settingsStore.updateLanguage(lang)
  // 更新菜单语言
  window.electronAPI?.updateMenuLanguage?.(lang)
  // 重新加载页面以应用语言
  location.reload()
}

const saveApiConfigs = () => {
  // 清除之前的错误
  saveError.value = null
  
  // 检查是否有验证错误
  if (Object.keys(validationErrors).length > 0) {
    saveError.value = '请修正输入错误后再保存'
    return
  }
  
  let hasError = false
  let errorMessage = ''

  // 验证所有配置
  const providers: Array<keyof typeof apiConfigs.value> = ['qianfan', 'dashscope', 'deepseek', 'openai']
  
  for (const provider of providers) {
    const config = apiConfigs.value[provider]
    
    // 跳过空配置
    if (provider === 'qianfan') {
      const qianfanConfig = config as { accessKey: string; secretKey: string }
      if (!qianfanConfig.accessKey && !qianfanConfig.secretKey) continue
    } else {
      const otherConfig = config as { apiKey: string; baseUrl: string }
      if (!otherConfig.apiKey) continue
    }
    
    const result = settingsStore.updateApiKey(provider, config)
    if (!result.success) {
      hasError = true
      errorMessage = result.error || '保存失败'
      break
    }
  }

  if (hasError) {
    saveError.value = errorMessage
  } else {
    showSavedMessage.value = true
    setTimeout(() => {
      showSavedMessage.value = false
    }, 2000)
  }
}

const resetSettings = () => {
  if (confirm('确定要重置所有设置吗？')) {
    settingsStore.resetSettings()
    apiConfigs.value = {
      qianfan: { ...settingsStore.settings.apiKeys.qianfan },
      dashscope: { ...settingsStore.settings.apiKeys.dashscope },
      deepseek: { ...settingsStore.settings.apiKeys.deepseek },
      openai: { ...settingsStore.settings.apiKeys.openai },
    }
  }
}

onMounted(() => {
  apiConfigs.value = {
    qianfan: { ...settingsStore.settings.apiKeys.qianfan },
    dashscope: { ...settingsStore.settings.apiKeys.dashscope },
    deepseek: { ...settingsStore.settings.apiKeys.deepseek },
    openai: { ...settingsStore.settings.apiKeys.openai },
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
