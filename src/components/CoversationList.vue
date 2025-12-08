<template>
  <div class="conversation-list">
    <div
      v-for="item in items"
      :key="item.id"
      class="item border-gray-300 border-t cursor-pointer p-2"
      :class="{
        'bg-gray-100 hover:bg-gray-300': item.id === store.selectedId,
        'bg-white hover:bg-gray-200': item.id !== store.selectedId,
      }"
    >
      <a @click.prevent="goToConversation(item.id)">
        <div
          class="flex justify-between items-center text-sm leading-5 text-gray-500"
        >
          <span>{{ item.selectedModel }}</span>
          <span>{{ dayjs(item.updatedAt).format("YYYY-MM-DD") }}</span>
        </div>
        <h2 class="font-semibold leading-6 text-gray-900 truncate">
          {{ item.title }}
        </h2>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
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
</script>
