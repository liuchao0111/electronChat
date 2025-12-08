<template>
  <div class="w-[80%] mx-auto h-full">
    <div class="flex items-center h-[85%]">
      <ProviderSelect :items="providers" v-model="currentProvider" />
    </div>
    <div class="flex items-center h-[15%]">
      <MessageInput
        @create="createConversation"
        :disabled="currentProvider === ''"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { db } from "../db";
import { ProviderProps } from "src/types";
import { useRouter } from "vue-router";
import { useConversationStore } from "../stores/conversation";
import ProviderSelect from "../components/ProviderSelect.vue";
import MessageInput from "../components/MessageInput.vue";
const conversationStore = useConversationStore();
const currentProvider = ref<string>("");
const providers = ref<ProviderProps[]>([]);
const router = useRouter();
onMounted(async () => {
  providers.value = await db.providers.toArray();
});
const modelInfo = computed(() => {
  const [providerId, selectedModel] = currentProvider.value.split("|");
  return { providerId: parseInt(providerId), selectedModel };
});
const createConversation = async (question: string, imagePath?: string) => {
  const { providerId, selectedModel } = modelInfo.value;

  // imagePath 已经是 MessageInput 组件中保存后的路径，不需要再次复制
  const currentDate = new Date().toISOString();
  const conversationId = await conversationStore.createConversation({
    title: question,
    providerId,
    selectedModel,
    createdAt: currentDate,
    updatedAt: currentDate,
  });
  const newMessageId = await db.messages.add({
    content: question,
    conversationId,
    createdAt: currentDate,
    updatedAt: currentDate,
    type: "question",
    ...(imagePath && { imagePath }),
  });
  router.push(`/conversation/${conversationId}?init=${newMessageId}`);
};
</script>
<style lang="scss" scoped></style>
