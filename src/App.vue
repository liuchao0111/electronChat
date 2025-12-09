<template>
  <div 
    class="flex items-center justify-between h-screen"
    :class="[fontSizeClass, themeClass]"
  >
    <div 
      class="w-[300px] h-full border-r"
      :class="[
        settingsStore.settings.theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-gray-200 border-gray-300'
      ]"
    >
      <div class="h-[90%] overflow-y-auto">
        <CoversationList :items="items" />
      </div>
      <div
        class="h-[10%] grid grid-cols-2 gap-2 p-2 items-center justify-center"
      >
        <RouterLink to="/" class="text-center">
          <Button color="green" icon-name="radix-icons:chat-bubble"
            >新建聊天</Button
          >
        </RouterLink>
        <RouterLink to="/settings" class="text-center">
          <Button color="green" plain icon-name="radix-icons:gear"
            >应用设置</Button
          >
        </RouterLink>
      </div>
    </div>
    <div class="flex flex-col justify-center items-center h-full flex-1">
      <RouterView />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import Button from "./components/Button.vue";
import CoversationList from "./components/CoversationList.vue";
import { initProviders } from "./db";
import { useConversationStore } from "./stores/conversation";
import { useSettingsStore } from "./stores/settings";

const router = useRouter();
const conversationStore = useConversationStore();
const settingsStore = useSettingsStore();
const items = computed(() => conversationStore.items);

const fontSizeClass = computed(() => {
  const sizeMap = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  }
  return sizeMap[settingsStore.settings.fontSize]
})

const themeClass = computed(() => {
  const theme = settingsStore.settings.theme
  if (theme === 'dark') return 'dark bg-gray-900 text-white'
  if (theme === 'light') return 'bg-white text-gray-900'
  // auto: 根据系统偏好
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark bg-gray-900 text-white'
  }
  return 'bg-white text-gray-900'
})

// 监听主题变化，确保响应式更新
watch(
  () => settingsStore.settings.theme,
  (newTheme) => {
    console.log('Theme changed to:', newTheme)
  }
)

// 监听菜单事件
function handleMenuNewConversation() {
  console.log('Menu: New Conversation')
  router.push('/')
}

function handleMenuOpenSettings() {
  console.log('Menu: Open Settings')
  router.push('/settings')
}

onMounted(async () => {
  await initProviders();
  conversationStore.fetchConversations();
  
  // 根据当前语言设置更新菜单
  const currentLanguage = settingsStore.settings.language;
  window.electronAPI?.updateMenuLanguage?.(currentLanguage);
  
  // 注册菜单事件监听器
  window.electronAPI?.onMenuNewConversation?.(handleMenuNewConversation);
  window.electronAPI?.onMenuOpenSettings?.(handleMenuOpenSettings);
});

onUnmounted(() => {
  // 清理事件监听器（如果需要）
});
</script>
