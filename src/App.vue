<template>
  <div class="flex items-center justify-between h-screen">
    <div class="w-[300px] bg-gray-200 h-full border-r border-gray-300">
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
import { computed, onMounted } from "vue";
import Button from "./components/Button.vue";
import CoversationList from "./components/CoversationList.vue";
import { initProviders } from "./db";
import { useConversationStore } from "./stores/conversation";
const conversationStore = useConversationStore();
const items = computed(() => conversationStore.items);
onMounted(async () => {
  await initProviders();
  conversationStore.fetchConversations();
});
</script>
