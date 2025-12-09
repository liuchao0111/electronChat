# 设计文档 - 项目优化

## 概述

本设计文档描述了 VChat 应用优化的技术实现方案，包括架构改进、性能优化、安全增强等方面的具体设计。

## 架构设计

### 1. Provider 工厂模式

**目标**：统一管理多个 AI Provider 的创建和配置

**设计方案**：

```typescript
// src/providers/createProvider.ts
interface ProviderConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

interface ProviderFactory {
  create(type: ProviderType, config: ProviderConfig): AIProvider;
}

class ProviderFactoryImpl implements ProviderFactory {
  private providers: Map<ProviderType, AIProvider> = new Map();
  
  create(type: ProviderType, config: ProviderConfig): AIProvider {
    // 单例模式：复用已创建的 provider
    if (this.providers.has(type)) {
      return this.providers.get(type)!;
    }
    
    // 根据类型创建对应的 provider
    const provider = this.createProviderInstance(type, config);
    this.providers.set(type, provider);
    return provider;
  }
  
  private createProviderInstance(type: ProviderType, config: ProviderConfig): AIProvider {
    switch (type) {
      case 'qianfan':
        return new QianfanProvider(config);
      case 'dashscope':
        return new DashScopeProvider(config);
      case 'deepseek':
        return new DeepSeekProvider(config);
      case 'openai':
        return new OpenAIProvider(config);
      default:
        throw new Error(`未知的提供商: ${type}`);
    }
  }
}
```

**优势**：
- 集中管理 provider 创建逻辑
- 支持 provider 复用（单例模式）
- 易于添加新的 provider
- 类型安全

### 2. IPC 通信架构

**目标**：模块化 IPC 通信，提高可维护性

**设计方案**：

```
src/ipc/
├── index.ts           # IPC 注册入口
├── handlers/
│   ├── chat.ts        # 聊天相关 IPC
│   ├── conversation.ts # 对话管理 IPC
│   ├── settings.ts    # 设置相关 IPC
│   └── window.ts      # 窗口管理 IPC
└── types.ts           # IPC 消息类型定义
```

**实现示例**：

```typescript
// src/ipc/handlers/chat.ts
export function registerChatHandlers(ipcMain: IpcMain) {
  ipcMain.handle('chat:send', async (event, payload: ChatPayload) => {
    try {
      const provider = createProvider(payload.providerType, payload.config);
      const response = await provider.chat(payload.messages);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: formatError(error) };
    }
  });
}

// src/ipc/index.ts
export function registerAllHandlers(ipcMain: IpcMain) {
  registerChatHandlers(ipcMain);
  registerConversationHandlers(ipcMain);
  registerSettingsHandlers(ipcMain);
  registerWindowHandlers(ipcMain);
}
```

**优势**：
- 按功能模块组织 IPC handlers
- 统一的错误处理
- 类型安全的消息传递
- 易于测试

### 3. 带缓存的状态管理

**目标**：优化数据库查询，减少重复请求

**设计方案**：

```typescript
// src/stores/conversation.ts
export const useConversationStore = defineStore('conversation', () => {
  const conversations = ref<Conversation[]>([]);
  const currentConversation = ref<Conversation | null>(null);
  const cache = new Map<string, { data: any; timestamp: number }>();
  
  const CACHE_TTL = 5 * 60 * 1000; // 5 分钟缓存
  
  async function fetchConversations(forceRefresh = false) {
    const cacheKey = 'conversations';
    const cached = cache.get(cacheKey);
    
    // 检查缓存
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      conversations.value = cached.data;
      return cached.data;
    }
    
    // 从数据库获取
    const data = await db.conversations
      .orderBy('updatedAt')
      .reverse()
      .limit(50)
      .toArray();
    
    // 更新缓存
    cache.set(cacheKey, { data, timestamp: Date.now() });
    conversations.value = data;
    return data;
  }
  
  function invalidateCache(key?: string) {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  }
  
  return {
    conversations,
    currentConversation,
    fetchConversations,
    invalidateCache,
  };
});
```

**优势**：
- 减少数据库查询次数
- 提高响应速度
- 支持强制刷新
- 自动过期机制

### 4. 安全性 - API Key 加密

**目标**：安全存储用户的 API Keys

**设计方案**：

```typescript
// src/utils/security.ts
import { safeStorage } from 'electron';

export class SecureStorage {
  static isEncryptionAvailable(): boolean {
    return safeStorage.isEncryptionAvailable();
  }
  
  static encryptString(plainText: string): string {
    if (!this.isEncryptionAvailable()) {
      console.warn('加密不可用，使用 base64 降级方案');
      return Buffer.from(plainText).toString('base64');
    }
    
    const buffer = safeStorage.encryptString(plainText);
    return buffer.toString('base64');
  }
  
  static decryptString(encrypted: string): string {
    if (!this.isEncryptionAvailable()) {
      return Buffer.from(encrypted, 'base64').toString('utf-8');
    }
    
    const buffer = Buffer.from(encrypted, 'base64');
    return safeStorage.decryptString(buffer);
  }
}

// 使用示例
function saveApiKey(provider: string, apiKey: string) {
  const encrypted = SecureStorage.encryptString(apiKey);
  localStorage.setItem(`${provider}_api_key`, encrypted);
}

function getApiKey(provider: string): string | null {
  const encrypted = localStorage.getItem(`${provider}_api_key`);
  if (!encrypted) return null;
  return SecureStorage.decryptString(encrypted);
}
```

**安全特性**：
- 使用系统级加密（macOS Keychain, Windows DPAPI）
- 降级方案（base64）用于不支持的系统
- 只在需要时解密
- 不在内存中长期保存明文

### 5. 错误处理策略

**目标**：统一的错误处理和用户友好的错误提示

**设计方案**：

```typescript
// src/utils/errorHandler.ts
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  details?: any;
}

export class ErrorHandler {
  static handle(error: unknown): AppError {
    // OpenAI API 错误
    if (error instanceof Error && 'status' in error) {
      const apiError = error as any;
      
      if (apiError.status === 401) {
        return {
          type: ErrorType.AUTHENTICATION,
          message: apiError.message,
          userMessage: 'API Key 无效，请检查设置中的 API Key 是否正确',
        };
      }
      
      if (apiError.status === 402) {
        return {
          type: ErrorType.AUTHENTICATION,
          message: 'Insufficient Balance',
          userMessage: '账户余额不足，请充值后重试',
        };
      }
      
      if (apiError.status >= 500) {
        return {
          type: ErrorType.NETWORK,
          message: apiError.message,
          userMessage: '服务器错误，请稍后重试',
        };
      }
    }
    
    // 网络错误
    if (error instanceof Error && error.message.includes('fetch')) {
      return {
        type: ErrorType.NETWORK,
        message: error.message,
        userMessage: '网络连接失败，请检查网络设置',
      };
    }
    
    // 未知错误
    return {
      type: ErrorType.UNKNOWN,
      message: error instanceof Error ? error.message : String(error),
      userMessage: '发生未知错误，请重试',
      details: error,
    };
  }
  
  static log(error: AppError) {
    console.error(`[${error.type}] ${error.message}`, error.details);
  }
}
```

**使用示例**：

```typescript
try {
  const response = await provider.chat(messages);
  return response;
} catch (error) {
  const appError = ErrorHandler.handle(error);
  ErrorHandler.log(appError);
  
  // 显示用户友好的错误消息
  ElMessage.error(appError.userMessage);
  
  return null;
}
```

### 6. 性能优化

#### 6.1 路由懒加载

```typescript
// src/router/index.ts
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'), // 懒加载
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
  },
  {
    path: '/chat/:id',
    name: 'Chat',
    component: () => import('../views/Chat.vue'),
  },
];
```

#### 6.2 消息列表虚拟滚动

```vue
<!-- src/components/MessageList.vue -->
<template>
  <RecycleScroller
    :items="messages"
    :item-size="80"
    key-field="id"
    v-slot="{ item }"
  >
    <MessageItem :message="item" />
  </RecycleScroller>
</template>
```

#### 6.3 流式响应防抖渲染

```typescript
// src/composables/useStreamChat.ts
export function useStreamChat() {
  const currentMessage = ref('');
  let buffer = '';
  
  // 防抖更新，避免频繁渲染
  const debouncedUpdate = debounce(() => {
    currentMessage.value = buffer;
  }, 100);
  
  async function sendStreamMessage(messages: Message[]) {
    buffer = '';
    currentMessage.value = '';
    
    const stream = await provider.chatStream(messages);
    
    for await (const chunk of stream) {
      buffer += chunk.content;
      debouncedUpdate();
    }
    
    // 最后一次更新
    currentMessage.value = buffer;
  }
  
  return { currentMessage, sendStreamMessage };
}
```

### 7. 构建优化

**Vite 配置优化**：

```typescript
// vite.renderer.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['radix-vue'],
          'markdown': ['vue-markdown-render', 'markdown-it-highlightjs'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
  },
});
```

## 数据流

### 消息发送流程

```
用户输入
    ↓
Vue 组件 (Chat.vue)
    ↓
Store 操作 (sendMessage)
    ↓
IPC 调用 (chat:send)
    ↓
主进程处理器
    ↓
Provider 工厂
    ↓
AI Provider (OpenAI/DeepSeek/等)
    ↓
流式响应
    ↓
IPC 响应
    ↓
Store 更新
    ↓
UI 更新（响应式）
```

### 设置持久化流程

```
用户修改设置
    ↓
Settings Store (updateSettings)
    ↓
验证 (validateApiKey)
    ↓
加密 (SecureStorage)
    ↓
localStorage.setItem
    ↓
响应式更新 (watch)
    ↓
UI 更新
```

## 数据库模式

### Conversations 表

```typescript
interface Conversation {
  id: string;              // UUID
  title: string;           // 对话标题
  provider: ProviderType;  // AI 提供商
  model: string;           // 模型名称
  createdAt: number;       // 创建时间戳
  updatedAt: number;       // 更新时间戳（索引）
}

// Dexie 索引
db.version(1).stores({
  conversations: '++id, updatedAt, provider',
});
```

### Messages 表

```typescript
interface Message {
  id: string;              // UUID
  conversationId: string;  // 外键（索引）
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
}

// Dexie 索引
db.version(1).stores({
  messages: '++id, conversationId, timestamp',
});
```

## UI/UX 设计决策

### 1. 加载状态

- **全局加载**：应用启动时显示启动画面
- **局部加载**：消息发送时显示输入指示器
- **骨架屏**：列表加载时显示骨架占位符

### 2. 错误显示

- **Toast 通知**：临时错误（网络错误）
- **内联错误**：表单验证错误
- **错误页面**：严重错误（应用崩溃）

### 3. 响应式设计

- **最小窗口尺寸**：800x600
- **侧边栏**：可折叠，宽度 280px
- **消息区域**：自适应宽度，最大 800px

## 安全考虑

1. **API Key 存储**：使用系统加密 API
2. **XSS 防护**：Markdown 渲染时过滤危险标签
3. **CSP 策略**：限制外部资源加载
4. **输入验证**：所有用户输入都需验证

## 测试策略

1. **单元测试**：工具函数、Store actions
2. **集成测试**：IPC 通信、Provider 调用
3. **E2E 测试**：关键用户流程
4. **性能测试**：大量消息渲染性能

## 监控和日志

### 开发模式
- 控制台日志，包含详细上下文
- Vue DevTools 集成
- 网络请求日志

### 生产模式
- 用户数据目录中的文件日志
- 带堆栈跟踪的错误追踪
- 性能指标收集

## 参考资料

- [Electron 安全最佳实践](https://www.electronjs.org/docs/latest/tutorial/security)
- [Vue 3 性能指南](https://vuejs.org/guide/best-practices/performance.html)
- [Pinia 最佳实践](https://pinia.vuejs.org/cookbook/)
