import Dexie, { type EntityTable } from "dexie";
import { ConversationProps, MessageProps, ProviderProps } from "./types";
import { providers } from "./testData";

export const db = new Dexie("vChatDatabase") as Dexie & {
  providers: EntityTable<ProviderProps, "id">;
  conversations: EntityTable<ConversationProps, "id">;
  messages: EntityTable<MessageProps, "id">;
};


db.version(1).stores({
  providers: "++id, name",
  conversations: "++id, providerId",
  messages: "++id, conversationId",
});

export const initProviders = async () => {
  const count = await db.providers.count();
  if (count === 0) {
    await db.providers.bulkAdd(providers);
  } else {
    // 更新现有 providers，添加新的 provider
    for (const provider of providers) {
      const existing = await db.providers.get(provider.id);
      if (existing) {
        await db.providers.update(provider.id, provider);
      } else {
        await db.providers.add(provider);
      }
    }
  }
}

// export const initConversations = async (conversations: ConversationProps[]) => {
//   const count = await db.conversations.count();
//   if (count === 0) {
//     await db.conversations.bulkAdd(conversations);
//   }
// }

// export const initMessages = async (messages: MessageProps[]) => {
//   const count = await db.messages.count();
//   if (count === 0) {
//     await db.messages.bulkAdd(messages);
//   }
// }