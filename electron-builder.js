// electron-builder.js
/**
 * Electron Builder 配置文件
 * 配置应用打包和分发设置
 */

module.exports = {
  appId: 'com.electron.words-via-subtitle',
  productName: '字幕学单词',
  copyright: 'Copyright © 2025',

  // 应用图标配置
  mac: {
    category: 'public.app-category.education',
    icon: 'assets/icons/mac/icon.icns',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    darkModeSupport: true,
  },
  win: {
    icon: 'assets/icons/win/icon.ico',
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
    ],
  },
  linux: {
    icon: 'assets/icons/linux',
    target: ['AppImage', 'deb'],
    category: 'Education',
  },

  // 文件配置
  files: ['dist/main/**/*', 'dist/renderer/**/*', '!**/node_modules/**/*', 'package.json'],

  // 构建配置
  directories: {
    output: 'release',
    buildResources: 'assets',
  },

  // 自动更新配置
  publish: {
    provider: 'github',
    releaseType: 'release',
  },

  // NSIS 安装程序配置（Windows）
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: '字幕学单词',
  },

  extraMetadata: {
    main: 'dist/main/main.js',
  },

  // 构建后处理
  afterSign: 'scripts/notarize.js',
};
