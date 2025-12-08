<template>
  <div class="message-list" ref="_ref">
    <div
      class="message-item mb-3"
      v-for="message in messages"
      :key="message.id"
    >
      <div class="flex" :class="{ 'justify-end': message.type === 'question' }">
        <div>
          <div
            class="text-sm text-gray-500 mb-2"
            :class="{ 'text-right': message.type === 'question' }"
          >
            {{ dayjs(message.createdAt).format("YYYY-MM-DD") }}
          </div>
          <div
            class="message-question bg-green-700 text-white p-2 rounded-md"
            v-if="message.type === 'question'"
          >
            <img v-if="message.imagePath" :src="`safe-file://${message.imagePath}`" class="w-24 h-24 object-cover rounded block"/>
            {{ message.content }}
          </div>
          <div
            class="message-answer bg-gray-200 text-gray-700 p-2 rounded-md"
            v-else
          >
            <template v-if="message.status === 'loading'">
              <Icon icon="eos-icons:three-dots-loading"></Icon>
            </template>
            <div
              class="prose prose-slate prose-headings:my-2 prose-li:my-0 prose-u1:my-1 prose-pre:p-0"
              v-else
            >
              <VueMarkdown :source="message.content" :plugins="plugins" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { MessageProps } from "../types";
import dayjs from "dayjs";
import hljs from "markdown-it-highlightjs";
import VueMarkdown from "vue-markdown-render";
defineProps<{
  messages: MessageProps[];
}>();
const _ref = ref<HTMLElement | null>(null);
const plugins = [hljs];
defineExpose({
  _ref,
});
</script>
<style lang="scss" scoped></style>
