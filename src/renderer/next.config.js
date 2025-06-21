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
