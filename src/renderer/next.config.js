/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  // 配置Next.js处理Electron集成
  webpack: (config, { isServer }) => {
    // 在Next.js中导入Electron模块时避免错误
    if (!isServer) {
      config.target = 'electron-renderer';

      // 修复 global 变量问题
      config.resolve.fallback = {
        ...config.resolve.fallback,
        global: false,
      };

      // 定义 global 变量
      const webpack = require('webpack');
      config.plugins.push(
        new webpack.DefinePlugin({
          global: 'globalThis',
        })
      );
    }

    return config;
  },
  // 禁用外部图片优化，使用相对路径
  images: {
    unoptimized: true,
  },
  // 将输出构建到自定义目录
  distDir: '../../dist/renderer',
};

module.exports = nextConfig;
