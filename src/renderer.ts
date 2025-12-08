/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import "./index.css";
import "highlight.js/styles/github-dark.min.css";
import { createRouter, createMemoryHistory } from "vue-router";
import { createPinia } from "pinia";
import { useConversationStore } from "./stores/conversation";
import { createApp } from "vue";
import App from "./App.vue";
import Home from "./views/Home.vue";
import Conversation from "./views/Conversation.vue";
import Settings from "./views/Settings.vue";
const routes = [
  { path: "/", component: Home },
  { path: "/conversation/:id", component: Conversation },
  { path: "/settings", component: Settings },
];

const pinia = createPinia();

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const conversationStore = useConversationStore();
  if (!to.path.startsWith("/conversation/")) {
    conversationStore.selectedId = -1;
  }
});

createApp(App).use(router).use(pinia).mount("#app");

console.log(
  '👋 This message is being logged by "renderer.ts", included via Vite'
);
