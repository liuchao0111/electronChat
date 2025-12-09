# 菜单功能实现说明

## 功能概述

为应用添加了自定义菜单功能，包含两个个性化选项：**新建对话** 和 **设置**，同时保持系统默认菜单（Edit、View 等）。

## 实现方式

### 1. 新建文件 `src/menu.ts`

这是一个独立的菜单配置文件，不影响原有的 `main.ts` 逻辑。

**功能特点：**
- ✅ 添加"文件"菜单，包含"新建对话"和"设置"两个选项
- ✅ 保持系统默认菜单：编辑、视图、窗口、帮助
- ✅ 支持快捷键：
  - `Cmd/Ctrl + N` - 新建对话
  - `Cmd/Ctrl + ,` - 打开设置
- ✅ 个性化选项只发射事件，不包含具体逻辑
- ✅ 跨平台支持（macOS 和 Windows/Linux）

### 2. 事件流程

```
菜单点击 → 发射事件 → 渲染进程监听 → 路由跳转
```

#### 主进程（menu.ts）
```typescript
// 点击"新建对话"
focusedWindow.webContents.send('menu-new-conversation')

// 点击"设置"
focusedWindow.webContents.send('menu-open-settings')
```

#### 预加载脚本（preload.ts）
```typescript
onMenuNewConversation: (callback) => {
  ipcRenderer.on("menu-new-conversation", callback)
}
```

#### 渲染进程（App.vue）
```typescript
window.electronAPI?.onMenuNewConversation?.(() => {
  router.push('/')
})
```

### 3. 文件修改清单

#### 新增文件：
- `src/menu.ts` - 菜单配置文件

#### 修改文件：
- `src/main.ts` - 导入并初始化菜单
- `src/preload.ts` - 添加菜单事件监听器
- `src/App.vue` - 监听菜单事件并处理路由跳转
- `interface.d.ts` - 添加类型定义

## 使用方法

### 启动应用后：

1. **通过菜单栏操作：**
   - 点击 `文件 → 新建对话` 跳转到首页
   - 点击 `文件 → 设置` 跳转到设置页面

2. **通过快捷键操作：**
   - `Cmd/Ctrl + N` - 新建对话
   - `Cmd/Ctrl + ,` - 打开设置

3. **系统默认菜单：**
   - 编辑菜单：撤销、重做、剪切、复制、粘贴等
   - 视图菜单：重新加载、开发者工具、缩放等
   - 窗口菜单：最小化、关闭等
   - 帮助菜单：了解更多

## 菜单结构

```
应用名称（仅 macOS）
  ├─ 关于
  ├─ 服务
  ├─ 隐藏
  └─ 退出

文件
  ├─ 新建对话 (Cmd/Ctrl+N)
  ├─ 设置 (Cmd/Ctrl+,)
  └─ 退出/关闭

编辑
  ├─ 撤销
  ├─ 重做
  ├─ 剪切
  ├─ 复制
  ├─ 粘贴
  └─ 全选

视图
  ├─ 重新加载
  ├─ 强制重新加载
  ├─ 切换开发者工具
  ├─ 实际大小
  ├─ 放大
  ├─ 缩小
  └─ 切换全屏

窗口
  ├─ 最小化
  ├─ 缩放
  └─ 关闭

帮助
  └─ 了解更多
```

## 扩展说明

### 如何添加新的菜单项？

在 `src/menu.ts` 中的相应菜单 `submenu` 数组中添加：

```typescript
{
  label: '新功能',
  accelerator: 'CmdOrCtrl+K',
  click: () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) {
      focusedWindow.webContents.send('menu-new-feature')
    }
  }
}
```

然后在 `preload.ts` 和 `App.vue` 中添加相应的事件监听器。

### 注意事项

1. **事件命名规范**：使用 `menu-` 前缀，如 `menu-new-conversation`
2. **快捷键冲突**：避免与系统默认快捷键冲突
3. **跨平台兼容**：使用 `CmdOrCtrl` 而不是 `Cmd` 或 `Ctrl`
4. **事件清理**：在组件卸载时清理事件监听器（如需要）

## 测试清单

- [x] 菜单显示正常
- [x] "新建对话"功能正常
- [x] "设置"功能正常
- [x] 快捷键工作正常
- [x] 系统默认菜单保持不变
- [x] macOS 和 Windows 兼容性
- [x] 无 TypeScript 错误
- [x] 事件正确发射和接收

---

**实现日期**: 2025-12-08
**版本**: 1.2.0
