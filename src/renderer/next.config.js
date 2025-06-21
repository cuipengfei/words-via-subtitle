/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // 暂时禁用 ESLint 检查以解决配置问题
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 禁用外部图片优化，使用相对路径
  images: {
    unoptimized: true,
  },
  // 配置Next.js处理Electron集成
  webpack: (config, { isServer, dev }) => {
    // 配置源映射以支持开发者工具调试
    if (dev) {
      config.devtool = 'eval-source-map';
    }

    // 在Next.js中导入Electron模块时避免错误
    if (!isServer) {
      config.target = 'web';

      // Polyfill for 'global'
      config.plugins.push(
        new (require('webpack').DefinePlugin)({
          global: 'window',
        })
      );
    }

    return config;
  },
};

module.exports = nextConfig;
