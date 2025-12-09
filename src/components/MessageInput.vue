<template>
  <div class="w-full flex flex-col gap-2">
    <!-- 图片预览区（上方） -->
    <div v-if="images.length > 0" class="flex flex-wrap gap-2">
      <div
        class="relative w-20 h-20 border border-gray-300 rounded overflow-hidden group"
      >
        <img :src="images" alt="preview" class="w-full h-full object-cover" />
        <button
          type="button"
          @click="removeImage"
          class="absolute top-0 right-0 bg-red-600 text-white rounded-bl opacity-0 group-hover:opacity-100 transition-opacity p-1"
        >
          <Icon icon="mdi:close" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- 输入框与按钮（下方） -->
    <div class="w-full flex items-center">
      <!-- 上传图片按钮 -->
      <label
        for="image-upload"
        class="inline-flex items-center justify-center h-10 px-3 border border-gray-300 border-r-0 rounded-l-sm hover:bg-gray-50 cursor-pointer transition-colors"
        aria-label="upload image"
      >
        <Icon
          icon="mdi:image-plus"
          class="w-5 h-5"
          :class="[
            disabled
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-400 cursor-pointer hover:text-gray-600',
          ]"
          @click="triggerFileInput"
        />
        <input
          type="file"
          accept="image/*"
          ref="fileInput"
          class="hidden"
          @change="handleFileChange"
        />
      </label>

      <input
        v-model="value"
        :placeholder="placeholder"
        @keydown.enter="create"
        class="flex-1 h-10 px-3 border border-gray-300 border-r-0 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        aria-label="message input"
      />

      <button
        type="button"
        :disabled="!value.trim() || disabled"
        class="inline-flex items-center gap-2 bg-green-700 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 h-10 rounded-r-sm border border-gray-300 border-l-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
        aria-label="send message"
        @click="create"
      >
        <Icon :icon="sendIcon" class="w-4 h-4" />
        <span class="text-sm">发送</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Icon } from "@iconify/vue";
const fileInput = ref<HTMLInputElement | null>(null);
const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "create", value: string, imageFile?: string): void;
}>();

const value = ref(props.modelValue ?? "");
const images = ref("");

watch(
  () => props.modelValue,
  (v) => {
    if (v !== value.value) value.value = v ?? "";
  }
);
watch(value, (v) => emit("update:modelValue", v));

const placeholder = props.placeholder ?? "请输入消息…";
const sendIcon = "mdi:send";

const triggerFileInput = () => {
  if (!props.disabled) {
    fileInput.value?.click();
  }
};

let selectedImagePath: string | undefined = undefined;
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];

    console.log("开始处理文件:", file.name, "大小:", file.size);

    try {
      // 读取文件为 ArrayBuffer
      console.log("正在读取文件...");
      const arrayBuffer = await file.arrayBuffer();
      console.log("文件读取完成，大小:", arrayBuffer.byteLength);

      // 通过 IPC 发送文件数据到主进程保存
      console.log("正在发送到主进程...");
      selectedImagePath = await window.electronAPI.copyImageToUserDir({
        buffer: arrayBuffer,
        fileName: file.name,
      } as any);

      console.log("图片已保存到:", selectedImagePath);

      // 显示预览
      const reader = new FileReader();
      reader.onload = (e) => {
        images.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("图片上传失败，详细错误:", error);
      if (error instanceof Error) {
        console.error("错误消息:", error.message);
        console.error("错误堆栈:", error.stack);
      }
      alert(
        `图片上传失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }
};

const removeImage = () => {
  images.value = "";
  selectedImagePath = undefined;
}

const create = () => {
  // 必须有文字内容或图片才能发送
  if ((value && value.value.trim() !== "") || selectedImagePath) {
    console.log("MessageInput emit create:", {
      text: value.value.trim(),
      imagePath: selectedImagePath,
    });
    emit("create", value.value.trim() || "图片", selectedImagePath);
    value.value = "";
    selectedImagePath = undefined;
    images.value = "";
  }
};
</script>

<style scoped>
/* 可按需微调样式 */
</style>
