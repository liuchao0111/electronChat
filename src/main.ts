import { app, BrowserWindow, dialog, ipcMain, protocol } from "electron";
import { ChatCompletion } from "@baiducloud/qianfan";
import path from "node:path";
import fs from "fs/promises";
import { lookup } from "mime-types";
import started from "electron-squirrel-startup";
import "dotenv/config";
import OpenAI from "openai";
import { convertMessages } from "./helper";
import { CreateChatProps } from "./types";
import { createProvider } from "./providers/createProvider";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// 在窗口创建前注册 IPC 处理器
// 先移除可能存在的旧处理器，避免重复注册
ipcMain.removeHandler("copy-image-to-user-dir");

ipcMain.handle(
  "copy-image-to-user-dir",
  async (_event, fileData: { buffer: ArrayBuffer; fileName: string }) => {
    try {
      // 参数验证
      if (!fileData) {
        console.error("copy-image-to-user-dir: fileData 参数为空");
        throw new Error("fileData 参数为空");
      }
      if (!fileData.buffer) {
        console.error("copy-image-to-user-dir: fileData.buffer 为空");
        throw new Error("fileData.buffer 为空");
      }
      if (!fileData.fileName) {
        console.error("copy-image-to-user-dir: fileData.fileName 为空");
        throw new Error("fileData.fileName 为空");
      }

      console.log("接收到文件数据:", {
        fileName: fileData.fileName,
        bufferSize: fileData.buffer.byteLength,
      });

      const userDataPath = app.getPath("userData");
      const imagesDir = path.join(userDataPath, "images");
      await fs.mkdir(imagesDir, { recursive: true });

      const destPath = path.join(
        imagesDir,
        `${Date.now()}_${fileData.fileName}`
      );
      await fs.writeFile(destPath, Buffer.from(fileData.buffer));

      console.log("图片已保存到:", destPath);
      return destPath;
    } catch (error) {
      console.error("保存图片失败，详细错误:", error);
      throw error;
    }
  }
);

// 在窗口创建前注册 start-chat 处理器，避免重复注册
ipcMain.removeAllListeners("start-chat");

// 注册自定义协议处理器（只注册一次）
app.whenReady().then(() => {
  protocol.handle("safe-file", async (request) => {
    try {
      console.log("safe-file 请求:", request.url);
      const filePath = decodeURIComponent(
        request.url.slice("safe-file://".length)
      );
      console.log("解析后的文件路径:", filePath);

      const data = await fs.readFile(filePath);
      const mimeType = lookup(filePath) || "application/octet-stream";

      console.log("文件读取成功，MIME 类型:", mimeType);

      return new Response(data, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
        },
      });
    } catch (error) {
      console.error("safe-file 协议处理失败:", error);
      return new Response("File not found", { status: 404 });
    }
  });
});

const createWindow = async () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "VChat",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  ipcMain.on("start-chat", async (_event, data: CreateChatProps) => {
    try {
      if (!data) {
        console.error("start-chat: data 参数为空");
        return;
      }
      const { messageId, providerName, selectedModel, messages } = data;
      if (!messages || !Array.isArray(messages)) {
        console.error("start-chat: messages 无效", messages);
        return;
      }
      console.log(providerName, "providerNameproviderNameproviderName");
      const provider = createProvider(providerName);
      const stream = await provider.chat(messages, selectedModel);
      for await (const chunk of stream) {
        const content = {
          messageId,
          data: chunk,
        };
        mainWindow.webContents.send("update-message", content);
      }
    } catch (error) {
      console.log(error);
    }
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
