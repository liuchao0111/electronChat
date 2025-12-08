import { CreateChatProps, onUpdateMessageCallback } from "./src/types";
export interface IElectronAPI {
  startChat: (data: CreateChatProps) => void;
  onUpdateMessage: (callback: onUpdateMessageCallback) => void;
  copyImageToUserDir: (fileData: { buffer: ArrayBuffer; fileName: string }) => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
