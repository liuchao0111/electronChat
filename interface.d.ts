import { CreateChatProps, onUpdateMessageCallback } from "./src/types";
export interface IElectronAPI {
  startChat: (data: CreateChatProps) => void;
  onUpdateMessage: (callback: onUpdateMessageCallback) => void;
  copyImageToUserDir: (fileData: { buffer: ArrayBuffer; fileName: string }) => Promise<string>;
  onMenuNewConversation?: (callback: () => void) => void;
  onMenuOpenSettings?: (callback: () => void) => void;
  updateMenuLanguage?: (language: 'zh-CN' | 'en-US') => void;
  showConversationContextMenu: (conversationId: number) => void;
  onContextMenuDelete: (callback: (conversationId: number) => void) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
