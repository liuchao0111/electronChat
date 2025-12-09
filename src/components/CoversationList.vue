<template>
  <div class="conversation-list">
    <div
      v-for="item in items"
      :key="item.id"
      class="item border-gray-300 border-t cursor-pointer p-2 relative"
      :class="{
        'bg-gray-100 hover:bg-gray-300': item.id === store.selectedId,
        'bg-white hover:bg-gray-200': item.id !== store.selectedId,
      }"
      @click="goToConversation(item.id)"
      @contextmenu.prevent="showContextMenu(item.id)"
    >
      <div
        class="flex justify-between items-center text-sm leading-5 text-gray-500"
      >
        <span>{{ item.selectedModel }}</span>
        <span>{{ dayjs(item.updatedAt).format("YYYY-MM-DD") }}</span>
      </div>
      <h2 class="font-semibold leading-6 text-gray-900 truncate">
        {{ item.title }}
      </h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { useConversationStore } from "../stores/conversation";
import type { ConversationProps } from "../types";

const router = useRouter();
const store = useConversationStore();

defineProps<{
  items: ConversationProps[];
}>();

const goToConversation = (id: number) => {
  router.push(`/conversation/${id}`);
  store.selectedId = id;
};

// 显示 Electron 原生右键菜单
const showContextMenu = (id: number) => {
  window.electronAPI.showConversationContextMenu(id);
};

// 处理删除操作
const handleDelete = async (conversationId: number) => {
  // Electron 原生对话框会在主进程中显示
  // 这里直接处理删除逻辑
  try {
    await store.deleteConversation(conversationId);
    
    // 如果删除的是当前查看的对话，跳转到首页
    if (store.selectedId === conversationId) {
      router.push('/');
    }
  } catch (error) {
    console.error('删除对话失败:', error);
    alert('删除失败，请重试');
  }
};

onMounted(() => {
  // 监听来自主进程的删除事件
  window.electronAPI.onContextMenuDelete(handleDelete);
});

onUnmounted(() => {
  // 清理事件监听器（如果需要）
});
</script>


