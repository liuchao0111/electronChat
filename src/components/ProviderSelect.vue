<template>
  <div class="provider-select w-full">
    <SelectRoot v-model="currentModel">
      <SelectTrigger
        class="flex w-full items-center justify-between rounded-md py-1.5 px-3 shadow-sm border outline-none data-placeholder:text-gray-400"
      >
        <SelectValue placeholder="Select a model..." />
        <Icon icon="radix-icons:chevron-down" class="h-5 w-5" />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent
          class="bg-white rounded-md shadow-md z-100 border border-white"
        >
          <SelectViewport class="p-2">
            <div v-for="provider in items" :key="provider.id">
              <SelectLabel class="flex items-center px-6 h-7 text-gray-500">
                <img
                  :src="provider.avatar"
                  :alt="provider.name"
                  class="h-5 w-5 mr-2 rounded"
                />
                {{ provider.name }}
              </SelectLabel>
              <SelectGroup>
                <SelectItem
                  v-for="(model, index) in provider.models"
                  :key="index"
                  :value="`${provider.id}|${model}`"
                  class="outline-none rounded flex items-center h-7 px-6 text-green-700 cursor-pointer data-highlighted:bg-green-700 data-highlighted:text-white relative"
                >
                  <SelectItemIndicator class="absolute left-2 w-6">
                    <Icon icon="radix-icons:check" />
                  </SelectItemIndicator>
                  <SelectItemText>{{ model }}</SelectItemText>
                </SelectItem>
              </SelectGroup>
              <SelectSeparator class="h-px my-2 bg-gray-300" />
            </div>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>

<script setup lang="ts">
import {
  SelectRoot,
  SelectValue,
  SelectTrigger,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectLabel,
  SelectGroup,
  SelectItemIndicator,
  SelectSeparator,
} from "radix-vue";
import type { ProviderProps } from "../types";
import { Icon } from "@iconify/vue";
defineProps<{
  items: ProviderProps[];
}>();
const currentModel = defineModel<string>();
</script>
<style lang="scss" scoped></style>
