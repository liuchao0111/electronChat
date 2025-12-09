import { defineStore } from "pinia";
import { db } from "../db";
import { ConversationProps } from "src/types";

export interface ConversationStore {
  items: ConversationProps[];
  selectedId?: number;
}

export const useConversationStore = defineStore("conversation", {
  state: (): ConversationStore => ({
    items: [],
    selectedId: -1,
  }),
  actions: {
    async fetchConversations() {
      this.items = await db.conversations.toArray();
    },
    async createConversation(createData: Omit<ConversationProps, "id">) {
      const id = await db.conversations.add(createData);
      this.items.push({ id, ...createData });
      return id;
    },
    async deleteConversation(id: number) {
      // 删除对话
      await db.conversations.delete(id);
      // 删除对话相关的所有消息
      await db.messages.where('conversationId').equals(id).delete();
      // 从状态中移除
      this.items = this.items.filter(item => item.id !== id);
      // 如果删除的是当前选中的对话，清除选中状态
      if (this.selectedId === id) {
        this.selectedId = -1;
      }
    },
  },
  getters: {
    getConversationById: (state) => {
      return (id: number) =>
        state.items.find((conversation) => conversation.id === id);
    },
  },
});
