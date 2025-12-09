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
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="ALTAKxxxxxxxxxxx"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">Secret Key</label>
                <input
                  v-model="apiConfigs.qianfan.secretKey"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0ad82210xxxxxxxxxxx"
                />
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
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="sk-xxxxxxxxxxxxxxxx"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">Base URL</label>
                <input
                  v-model="apiConfigs.dashscope.baseUrl"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
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
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="sk-xxxxxxxxxxxxxxxx"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">Base URL</label>
                <input
                  v-model="apiConfigs.deepseek.baseUrl"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
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
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="sk-proj-xxxxxxxxxxxxxxxx"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">Base URL</label>
                <input
                  v-model="apiConfigs.openai.baseUrl"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        </div>

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
            class="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>

      <!-- 保存成功提示 -->
      <Transition name="fade">
        <div
          v-if="showSavedMessage"
          class="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          保存成功
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore, type FontSize, type Theme, type Language } from '../stores/settings'

const settingsStore = useSettingsStore()
const activeTab = ref<'general' | 'models'>('general')
const showSavedMessage = ref(false)

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

function toggleProvider(provider: keyof typeof expandedProviders) {
  expandedProviders[provider] = !expandedProviders[provider]
}

function changeLanguage(lang: Language) {
  settingsStore.updateLanguage(lang)
  // 更新菜单语言
  window.electronAPI?.updateMenuLanguage?.(lang)
  // 重新加载页面以应用语言
  location.reload()
}

function saveApiConfigs() {
  let hasError = false
  let errorMessage = ''

  const providers: Array<keyof typeof apiConfigs.value> = ['qianfan', 'dashscope', 'deepseek', 'openai']
  
  for (const provider of providers) {
    const result = settingsStore.updateApiKey(provider, apiConfigs.value[provider])
    if (!result.success) {
      hasError = true
      errorMessage = result.error || '保存失败'
      break
    }
  }

  if (hasError) {
    alert(`保存失败: ${errorMessage}`)
  } else {
    showSavedMessage.value = true
    setTimeout(() => {
      showSavedMessage.value = false
    }, 2000)
  }
}

function resetSettings() {
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
