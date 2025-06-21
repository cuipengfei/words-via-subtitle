// webpack.config.js
/**
 * Webpack 配置文件
 * 用于打包 Electron 主进程代码
 */

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { DllPlugin } = require('webpack');

module.exports = {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  target: 'electron-main',
  entry: {
    main: './src/main/main.ts',
    preload: './src/main/preload.ts',
  },
  output: {
    path: path.resolve(__dirname, '../dist/main'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 2020,
          compress: {
            warnings: false,
            passes: 2,
          },
          mangle: true,
        },
      }),
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@/main': path.resolve(__dirname, '../src/main'),
      '@/shared': path.resolve(__dirname, '../src/shared'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, '../electron-tsconfig.json'),
          },
        },
      },
      // 处理原生模块
      {
        test: /\.node$/,
        use: 'node-loader',
      },
    ],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  plugins: [
    // 可选：使用 DLL 插件优化构建
    new DllPlugin({
      name: '[name]_dll',
      path: path.resolve(__dirname, '../dist/main/[name]-manifest.json'),
    }),
  ],
  // 排除打包的模块，通过 require 在运行时加载
  externals: {
    electron: 'electron',
  },
};
