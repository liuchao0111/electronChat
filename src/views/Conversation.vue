<template>
  <div
    class="w-full h-[10%] border-b border-gray-700 flex items-center px-3 justify-between"
  >
    <h3 class="font-semibold text-gray-900">{{ conversation?.title }}</h3>
    <span class="text-sm text-gray-400">
      {{ dayjs(conversation?.updatedAt).format("YYYY-MM-DD HH:mm:ss") }}
    </span>
  </div>
  <div class="w-[80%] max-auto h-[75%] overflow-y-auto pt-2">
    <MessageList :messages="filteredMessages" ref="messageListRef" />
  </div>
  <div class="flex w-[80%] items-center h-[15%] px-3">
    <MessageInput
      v-model="inputValue"
      @create="sendNewMessage"
      :disabled="messageStore.isMessageLoading"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { db } from "../db";
import { MessageProps, MessageStatus } from "../types";
import { useConversationStore } from "../stores/conversation";
import { useMessageStore } from "../stores/message";
import MessageList from "../components/MessageList.vue";
import MessageInput from "../components/MessageInput.vue";
import dayjs from "dayjs";
const route = useRoute();
const messageListRef = ref<InstanceType<typeof MessageList> | null>(null);
const inputValue = ref<string>("");
const conversationId = computed(() => Number(route.params.id));
const conversationStore = useConversationStore();
const messageStore = useMessageStore();
const conversation = computed(() =>
  conversationStore.items.find(
    (conv) => conv.id === Number(conversationId.value)
  )
);
const filteredMessages = computed(() => messageStore.items);
const sendedMessages = computed(() => {
  return filteredMessages.value
    .filter((msg) => msg.status !== "loading" && msg.status !== "streaming")
    .map((msg) => {
      return {
        role: msg.type === "question" ? "user" : "assistant",
        content: msg.content,
        ...(msg.imagePath && { imagePath: msg.imagePath }),
      };
    });
});
const initMessageId = route.query.init as string | undefined;

/**
 * 发送一条新消息（question）：
 * - 调用 messageStore.createMessage 创建新消息记录
 * - 清空输入框
 * - 触发 creatingInitialMessage 启动聊天流程
 */
const sendNewMessage = async (question: string, imagePath?: string) => {
  console.log("Conversation.vue sendNewMessage 接收到:", {
    question,
    imagePath,
    hasImagePath: !!imagePath,
  });

  if (question) {
    const date = new Date().toISOString();
    const messageData = {
      content: question,
      conversationId: conversationId.value,
      createdAt: date,
      updatedAt: date,
      type: "question" as const,
      ...(imagePath && { imagePath }),
    };

    console.log("准备保存到数据库的消息:", messageData);
    const messageId = await messageStore.createMessage(messageData);
    console.log("消息已保存，ID:", messageId);

    // 验证保存后的消息
    const savedMessage = await db.messages.get(messageId);
    console.log("从数据库读取的消息:", savedMessage);

    inputValue.value = "";
    creatingInitialMessage();
  }
};

/**
 * 创建一条初始的“answer (loading)”消息并写入 DB，然后触发后台开始聊天流程
 *
 * 步骤：
 * 1. 构造 createdData（不含 id）
 * 2. await db.messages.add(createdData) 获取新插入记录的 id（Dexie 返回主键）
 * 3. 把完整的消息对象 push 到 filteredMessages（用于立即显示）
 * 4. 根据 conversation.providerId 查询 provider，并通过 preload 暴露的 electronAPI 启动聊天
 *
 * 注意：
 * - db.messages.add 返回 Promise<主键>
 * - 调用 startChat 会将 messageId、providerName、selectModel、content 等交给主进程处理
 */
const creatingInitialMessage = async () => {
  // 在创建 loading 消息之前，先获取当前的消息列表
  const createdData: Omit<MessageProps, "id"> = {
    content: "",
    conversationId: conversationId.value,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: "answer",
    status: "loading",
  };
  // 插入并获取新消息的 id（Dexie 返回插入记录的主键）
  const newMessageId = await messageStore.createMessage(createdData);
  // 如果会话存在，从 providers 表中查询 provider 并通过 ipc 调用主进程开始聊天
  if (conversation.value) {
    const provider = await db.providers
      .where("id")
      .equals(conversation.value.providerId)
      .first();
    if (provider) {
      window.electronAPI.startChat({
        messageId: newMessageId,
        providerName: provider.name,
        selectedModel: conversation.value.selectedModel,
        messages: sendedMessages.value as any,
      });
    }
  }
};

const smothScrollToBottom = async () => {
  await nextTick();
  if (messageListRef.value?._ref) {
    const el = messageListRef.value._ref;
    el.scrollIntoView({ behavior: "smooth", block: "end" });
  }
};

/**
 * 页面挂载时的初始化逻辑：
 * - 从数据库加载会话详情（conversation）
 * - 从数据库加载该会话的消息列表到 filteredMessages
 * - 若存在 init query（表示需要创建初始消息），则读取上条消息内容并触发 creatingInitialMessage
 */
onMounted(async () => {
  await messageStore.fetchMessagesByConversation(Number(conversationId.value));
  await smothScrollToBottom();
  // 如果是初次创建对话（通过路由 query 指示），创建初始消息并启动聊天
  if (initMessageId) {
    await creatingInitialMessage();
  }
  let currentMessageListHeight = 0;
  let streamContent = "";
  // 优化
  const checkAndScrollToBottom = async () => {
    await nextTick();
    if (messageListRef.value?._ref) {
      const el = messageListRef.value._ref;
      if (el.clientHeight > currentMessageListHeight) {
        currentMessageListHeight = el.clientHeight;
        await smothScrollToBottom();
      }
    }
  };
  window.electronAPI.onUpdateMessage(async (streamData) => {
    const { messageId, data } = streamData;
    streamContent += data.result;
    const updateData = {
      content: streamContent,
      status: data.is_end ? "finished" : ("streaming" as MessageStatus),
      updatedAt: new Date().toISOString(),
    };
    await messageStore.updateMessage(messageId, updateData);
    await checkAndScrollToBottom();
  });
});

/**
 * 监听路由参数 id 的变化（切换左侧会话）：
 * - 每次路由 id 变化时，重新从数据库读取会话信息和对应消息列表，更新响应式数据
 */
watch(
  () => route.params.id,
  async (newId) => {
    await messageStore.fetchMessagesByConversation(Number(newId));
    await smothScrollToBottom();
  }
);
</script>
<style lang="scss" scoped></style>
