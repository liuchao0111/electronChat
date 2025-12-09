# 菜单多语言支持更新

## 功能说明

实现了菜单栏的中英文切换功能。当用户在设置中切换语言时，Electron 菜单栏的所有选项也会自动切换为对应的语言。

## 实现方式

### 1. 菜单文本翻译

在 `src/menu.ts` 中添加了完整的中英文翻译对照表：

```typescript
const menuTexts = {
  'zh-CN': {
    file: '文件',
    newConversation: '新建对话',
    settings: '设置',
    edit: '编辑',
    // ... 更多翻译
  },
  'en-US': {
    file: 'File',
    newConversation: 'New Conversation',
    settings: 'Settings',
    edit: 'Edit',
    // ... 更多翻译
  },
}
```

### 2. 动态菜单创建

`createAppMenu` 函数现在接受语言参数：

```typescript
export function createAppMenu(language: Language = 'zh-CN') {
  const t = menuTexts[language]
  // 使用 t.xxx 来获取对应语言的文本
}
```

### 3. 语言切换流程

```
用户点击语言切换
    ↓
Settings.vue 调用 updateLanguage()
    ↓
发送 IPC 消息到主进程
    ↓
主进程调用 updateMenuLanguage()
    ↓
重新创建菜单（使用新语言）
    ↓
页面重新加载
```

### 4. 应用启动时的语言同步

在 `App.vue` 的 `onMounted` 中：

```typescript
const currentLanguage = settingsStore.settings.language
window.electronAPI?.updateMenuLanguage?.(currentLanguage)
```

确保应用启动时菜单语言与用户设置一致。

## 支持的菜单项翻译

### 文件菜单
- 新建对话 / New Conversation
- 设置 / Settings
- 关闭 / Close
- 退出 / Quit

### 编辑菜单
- 撤销 / Undo
- 重做 / Redo
- 剪切 / Cut
- 复制 / Copy
- 粘贴 / Paste
- 粘贴并匹配样式 / Paste and Match Style
- 删除 / Delete
- 全选 / Select All
- 语音 / Speech
  - 开始朗读 / Start Speaking
  - 停止朗读 / Stop Speaking

### 视图菜单
- 重新加载 / Reload
- 强制重新加载 / Force Reload
- 切换开发者工具 / Toggle Developer Tools
- 实际大小 / Actual Size
- 放大 / Zoom In
- 缩小 / Zoom Out
- 切换全屏 / Toggle Fullscreen

### 窗口菜单
- 最小化 / Minimize
- 缩放 / Zoom
- 全部置于顶层 / Bring All to Front (macOS)
- 窗口 / Window

### 帮助菜单
- 了解更多 / Learn More

### macOS 应用菜单
- 关于 / About
- 服务 / Services
- 隐藏 / Hide
- 隐藏其他 / Hide Others
- 显示全部 / Show All
- 退出 / Quit

## 文件修改清单

### 修改的文件：

1. **src/menu.ts**
   - 添加 `menuTexts` 翻译对照表
   - `createAppMenu` 函数接受 `language` 参数
   - 添加 `updateMenuLanguage` 导出函数
   - 所有菜单项使用翻译文本

2. **src/main.ts**
   - 导入 `updateMenuLanguage`
   - 添加 `update-menu-language` IPC 处理器

3. **src/preload.ts**
   - 添加 `updateMenuLanguage` 方法

4. **interface.d.ts**
   - 添加 `updateMenuLanguage` 类型定义

5. **src/App.vue**
   - 在 `onMounted` 中同步菜单语言

6. **src/views/Settings.vue**
   - 在 `changeLanguage` 中调用 `updateMenuLanguage`

## 使用方法

### 切换语言：

1. 打开应用
2. 点击"应用设置"或使用快捷键 `Cmd/Ctrl + ,`
3. 在 General 标签页中选择语言
4. 点击"简体中文"或"English"
5. 页面重新加载，菜单栏语言同步切换

### 效果：

**中文模式：**
```
文件
  ├─ 新建对话 (Cmd/Ctrl+N)
  ├─ 设置 (Cmd/Ctrl+,)
  └─ 退出

编辑
  ├─ 撤销
  ├─ 重做
  └─ ...
```

**英文模式：**
```
File
  ├─ New Conversation (Cmd/Ctrl+N)
  ├─ Settings (Cmd/Ctrl+,)
  └─ Quit

Edit
  ├─ Undo
  ├─ Redo
  └─ ...
```

## 技术细节

### IPC 通信

**渲染进程 → 主进程：**
```typescript
ipcRenderer.send("update-menu-language", language)
```

**主进程处理：**
```typescript
ipcMain.on("update-menu-language", (_event, language) => {
  updateMenuLanguage(language)
})
```

### 语言持久化

语言设置保存在 `localStorage` 中（通过 `settingsStore`），应用重启后会自动恢复。

### 默认语言

如果用户没有设置语言，默认使用中文（`zh-CN`）。

## 扩展说明

### 如何添加新语言？

1. 在 `menuTexts` 中添加新语言的翻译：

```typescript
const menuTexts = {
  'zh-CN': { /* ... */ },
  'en-US': { /* ... */ },
  'ja-JP': {  // 日语
    file: 'ファイル',
    newConversation: '新しい会話',
    // ...
  },
}
```

2. 更新 `Language` 类型：

```typescript
type Language = 'zh-CN' | 'en-US' | 'ja-JP'
```

3. 在 Settings.vue 中添加语言选项。

### 注意事项

1. **快捷键不变**：快捷键（如 `Cmd/Ctrl+N`）在所有语言中保持一致
2. **系统角色**：使用 Electron 的 `role` 属性的菜单项会自动使用系统语言
3. **重新加载**：语言切换后需要重新加载页面以应用所有更改
4. **macOS 特殊性**：macOS 有额外的应用菜单，也已完全翻译

## 测试清单

- [x] 中文菜单显示正常
- [x] 英文菜单显示正常
- [x] 语言切换功能正常
- [x] 应用重启后语言保持
- [x] 所有菜单项都已翻译
- [x] 快捷键在所有语言下工作
- [x] macOS 和 Windows 兼容性
- [x] 无 TypeScript 错误

---

**更新日期**: 2025-12-08
**版本**: 1.3.0
