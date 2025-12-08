import { defineStore } from "pinia";
import { db } from "../db";
import { MessageProps, MessageStatus, UpdatedStreamProps } from "../types";

export interface MessageStore {
  items: MessageProps[];
}

export const useMessageStore = defineStore("message", {
  state: (): MessageStore => ({
    items: [],
  }),
  actions: {
    async fetchMessagesByConversation(conversationId: number) {
      this.items = await db.messages
        .where("conversationId")
        .equals(conversationId)
        .toArray();
    },
    async createMessage(createData: Omit<MessageProps, "id">) {
      const id = await db.messages.add(createData);
      this.items.push({ ...createData, id } as MessageProps);
      return id;
    },
    async updateMessage(messageId: number, streamData: Partial<MessageProps>) {
      // 在 filteredMessages 中找到对应的消息并更新内容
      await db.messages.update(messageId, streamData);
      const index = this.items.findIndex(
        (item: MessageProps) => item.id === messageId
      );
      if (index !== -1) {
        this.items[index] = {
          ...this.items[index],
          ...streamData,
        };
      }
    },
  },
  getters: {
    getMessageById: (state) => {
      return (id: number) =>
        state.items.findLast((msg) => msg.id === id && msg.type === "question");
    },
    isMessageLoading: (state) => {
      return state.items.some(
        (msg) => msg.status === "streaming" || msg.status === "loading"
      );
    },
  },
});
