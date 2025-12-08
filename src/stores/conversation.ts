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
  },
  getters: {
    getConversationById: (state) => {
      return (id: number) =>
        state.items.find((conversation) => conversation.id === id);
    },
  },
});
