// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { CreateChatProps, onUpdateMessageCallback } from "./types";

contextBridge.exposeInMainWorld("electronAPI", {
  startChat: (data: CreateChatProps) => ipcRenderer.send("start-chat", data),
  onUpdateMessage: (callback: onUpdateMessageCallback) => {
    ipcRenderer.on("update-message", (_event, data) => callback(data));
  },
  copyImageToUserDir: (fileData: { buffer: ArrayBuffer; fileName: string }) => 
    ipcRenderer.invoke("copy-image-to-user-dir", fileData), // 返回文件路径
  
  // 菜单事件监听器
  onMenuNewConversation: (callback: () => void) => {
    ipcRenderer.on("menu-new-conversation", callback);
  },
  onMenuOpenSettings: (callback: () => void) => {
    ipcRenderer.on("menu-open-settings", callback);
  },
  
  // 更新菜单语言
  updateMenuLanguage: (language: 'zh-CN' | 'en-US') => {
    ipcRenderer.send("update-menu-language", language);
  },
});
