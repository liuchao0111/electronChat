/**
 * 应用菜单配置
 * 
 * 功能说明：
 * 1. 添加两个个性化菜单项：新建对话 和 设置
 * 2. 保持系统默认菜单（Edit、View 等）
 * 3. 个性化选项只发射事件，不包含具体逻辑
 * 4. 支持中英文切换
 */

import { app, Menu, BrowserWindow, MenuItemConstructorOptions } from 'electron'

// 菜单文本翻译
const menuTexts = {
  'zh-CN': {
    file: '文件',
    newConversation: '新建对话',
    settings: '设置',
    close: '关闭',
    quit: '退出',
    edit: '编辑',
    undo: '撤销',
    redo: '重做',
    cut: '剪切',
    copy: '复制',
    paste: '粘贴',
    pasteAndMatchStyle: '粘贴并匹配样式',
    delete: '删除',
    selectAll: '全选',
    speech: '语音',
    startSpeaking: '开始朗读',
    stopSpeaking: '停止朗读',
    view: '视图',
    reload: '重新加载',
    forceReload: '强制重新加载',
    toggleDevTools: '切换开发者工具',
    resetZoom: '实际大小',
    zoomIn: '放大',
    zoomOut: '缩小',
    toggleFullscreen: '切换全屏',
    window: '窗口',
    minimize: '最小化',
    zoom: '缩放',
    front: '全部置于顶层',
    help: '帮助',
    learnMore: '了解更多',
    about: '关于',
    services: '服务',
    hide: '隐藏',
    hideOthers: '隐藏其他',
    unhide: '显示全部',
  },
  'en-US': {
    file: 'File',
    newConversation: 'New Conversation',
    settings: 'Settings',
    close: 'Close',
    quit: 'Quit',
    edit: 'Edit',
    undo: 'Undo',
    redo: 'Redo',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    pasteAndMatchStyle: 'Paste and Match Style',
    delete: 'Delete',
    selectAll: 'Select All',
    speech: 'Speech',
    startSpeaking: 'Start Speaking',
    stopSpeaking: 'Stop Speaking',
    view: 'View',
    reload: 'Reload',
    forceReload: 'Force Reload',
    toggleDevTools: 'Toggle Developer Tools',
    resetZoom: 'Actual Size',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    toggleFullscreen: 'Toggle Fullscreen',
    window: 'Window',
    minimize: 'Minimize',
    zoom: 'Zoom',
    front: 'Bring All to Front',
    help: 'Help',
    learnMore: 'Learn More',
    about: 'About',
    services: 'Services',
    hide: 'Hide',
    hideOthers: 'Hide Others',
    unhide: 'Show All',
  },
}

type Language = 'zh-CN' | 'en-US'

/**
 * 创建应用菜单
 */
export function createAppMenu(language: Language = 'zh-CN') {
  const isMac = process.platform === 'darwin'
  const t = menuTexts[language]

  const template: MenuItemConstructorOptions[] = [
    // macOS 应用菜单
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const, label: t.about },
              { type: 'separator' as const },
              { role: 'services' as const, label: t.services },
              { type: 'separator' as const },
              { role: 'hide' as const, label: t.hide },
              { role: 'hideOthers' as const, label: t.hideOthers },
              { role: 'unhide' as const, label: t.unhide },
              { type: 'separator' as const },
              { role: 'quit' as const, label: t.quit },
            ],
          },
        ]
      : []),

    // 文件菜单（包含个性化选项）
    {
      label: t.file,
      submenu: [
        {
          label: t.newConversation,
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // 发射事件到渲染进程
            const focusedWindow = BrowserWindow.getFocusedWindow()
            if (focusedWindow) {
              focusedWindow.webContents.send('menu-new-conversation')
            }
          },
        },
        {
          label: t.settings,
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            // 发射事件到渲染进程
            const focusedWindow = BrowserWindow.getFocusedWindow()
            if (focusedWindow) {
              focusedWindow.webContents.send('menu-open-settings')
            }
          },
        },
        { type: 'separator' },
        isMac ? { role: 'close', label: t.close } : { role: 'quit', label: t.quit },
      ],
    },

    // 编辑菜单（保持默认）
    {
      label: t.edit,
      submenu: [
        { role: 'undo' as const, label: t.undo },
        { role: 'redo' as const, label: t.redo },
        { type: 'separator' as const },
        { role: 'cut' as const, label: t.cut },
        { role: 'copy' as const, label: t.copy },
        { role: 'paste' as const, label: t.paste },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' as const, label: t.pasteAndMatchStyle },
              { role: 'delete' as const, label: t.delete },
              { role: 'selectAll' as const, label: t.selectAll },
              { type: 'separator' as const },
              {
                label: t.speech,
                submenu: [
                  { role: 'startSpeaking' as const, label: t.startSpeaking },
                  { role: 'stopSpeaking' as const, label: t.stopSpeaking },
                ],
              },
            ]
          : [
              { role: 'delete' as const, label: t.delete },
              { type: 'separator' as const },
              { role: 'selectAll' as const, label: t.selectAll },
            ]),
      ],
    },

    // 视图菜单（保持默认）
    {
      label: t.view,
      submenu: [
        { role: 'reload' as const, label: t.reload },
        { role: 'forceReload' as const, label: t.forceReload },
        { role: 'toggleDevTools' as const, label: t.toggleDevTools },
        { type: 'separator' as const },
        { role: 'resetZoom' as const, label: t.resetZoom },
        { role: 'zoomIn' as const, label: t.zoomIn },
        { role: 'zoomOut' as const, label: t.zoomOut },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const, label: t.toggleFullscreen },
      ],
    },

    // 窗口菜单（保持默认）
    {
      label: t.window,
      submenu: [
        { role: 'minimize' as const, label: t.minimize },
        { role: 'zoom' as const, label: t.zoom },
        ...(isMac
          ? [
              { type: 'separator' as const },
              { role: 'front' as const, label: t.front },
              { type: 'separator' as const },
              { role: 'window' as const, label: t.window },
            ]
          : [{ role: 'close' as const, label: t.close }]),
      ],
    },

    // 帮助菜单（保持默认）
    {
      role: 'help',
      label: t.help,
      submenu: [
        {
          label: t.learnMore,
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://electronjs.org')
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

/**
 * 在应用准备就绪时初始化菜单
 */
export function initMenu() {
  app.whenReady().then(() => {
    // 从 localStorage 读取语言设置（如果有）
    createAppMenu('zh-CN') // 默认中文
  })
}

/**
 * 更新菜单语言
 */
export function updateMenuLanguage(language: Language) {
  createAppMenu(language)
}
