import type { ForgeConfig } from '@electron-forge/shared-types';
// import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDMG } from '@electron-forge/maker-dmg';
// import { MakerDeb } from '@electron-forge/maker-deb';
// import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { PublisherGithub } from '@electron-forge/publisher-github';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'VChat',
    executableName: 'vchat',
    appBundleId: 'com.vchat.app',
    appCategoryType: 'public.app-category.productivity',
    icon: './assets/icon', // 如果有图标的话（不需要扩展名）
  },
  rebuildConfig: {},
  makers: [
    // new MakerSquirrel({}), // Windows 安装包
    new MakerZIP({}, ['darwin', 'linux']), // macOS 和 Linux ZIP
    new MakerDMG({
      // DMG 配置（macOS 磁盘映像）
      name: 'VChat',
      format: 'ULFO', // 压缩格式：ULFO (最快), UDBZ (最小), UDZO (兼容)
      overwrite: true,
      // 可选配置（如果有资源文件可以取消注释）：
      // background: './assets/dmg-background.png',
      // icon: './assets/icon.icns',
    }, ['darwin']), // 仅 macOS
    // new MakerRpm({}), // Linux RPM
    // new MakerDeb({}), // Linux DEB
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: 'your-github-username', // 替换为你的 GitHub 用户名
        name: 'vchat', // 替换为你的仓库名
      },
      prerelease: false, // 是否为预发布版本
      draft: true, // 是否创建为草稿（推荐先设为 true，检查后再发布）
    }),
  ],
};

export default config;
