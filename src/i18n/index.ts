export const messages = {
  'zh-CN': {
    settings: {
      title: '设置',
      appearance: '外观设置',
      fontSize: '字体大小',
      fontSizeSmall: '小',
      fontSizeMedium: '中',
      fontSizeLarge: '大',
      theme: '主题',
      themeLight: '浅色',
      themeDark: '深色',
      themeAuto: '跟随系统',
      language: '语言',
      languageZh: '简体中文',
      languageEn: 'English',
      apiConfig: 'API 配置',
      qianfan: '百度千帆',
      dashscope: '阿里灵积',
      deepseek: 'DeepSeek',
      openai: 'OpenAI',
      accessKey: 'Access Key',
      secretKey: 'Secret Key',
      apiKey: 'API Key',
      baseUrl: 'Base URL',
      save: '保存',
      reset: '重置',
      cancel: '取消',
      saved: '保存成功',
      resetConfirm: '确定要重置所有设置吗？',
    },
  },
  'en-US': {
    settings: {
      title: 'Settings',
      appearance: 'Appearance',
      fontSize: 'Font Size',
      fontSizeSmall: 'Small',
      fontSizeMedium: 'Medium',
      fontSizeLarge: 'Large',
      theme: 'Theme',
      themeLight: 'Light',
      themeDark: 'Dark',
      themeAuto: 'Auto',
      language: 'Language',
      languageZh: '简体中文',
      languageEn: 'English',
      apiConfig: 'API Configuration',
      qianfan: 'Baidu Qianfan',
      dashscope: 'Alibaba DashScope',
      deepseek: 'DeepSeek',
      openai: 'OpenAI',
      accessKey: 'Access Key',
      secretKey: 'Secret Key',
      apiKey: 'API Key',
      baseUrl: 'Base URL',
      save: 'Save',
      reset: 'Reset',
      cancel: 'Cancel',
      saved: 'Saved successfully',
      resetConfirm: 'Are you sure you want to reset all settings?',
    },
  },
}

export function useI18n(locale: 'zh-CN' | 'en-US' = 'zh-CN') {
  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = messages[locale]
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }
  return { t }
}
