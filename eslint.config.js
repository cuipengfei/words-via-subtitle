// @ts-check

/**
 * ESLint 配置文件 (ESLint v9 扁平配置格式)
 *
 * 此文件配置了项目的代码质量检查规则，针对不同文件类型和代码区域设置了
 * 特定的规则，以确保代码质量和一致性。
 *
 * 主要配置区域:
 * 1. 基础配置和忽略文件
 * 2. JavaScript基础推荐规则
 * 3. Node.js环境配置 (用于脚本和配置文件)
 * 4. 浏览器环境配置 (用于渲染进程)
 * 5. Electron主进程配置
 * 6. TypeScript规则
 * 7. React组件规则
 * 8. 类型定义文件特殊规则
 *
 * 使用: `bun run lint` 或 `bun run lint --quiet` 只显示错误
 */

const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const reactPlugin = require('eslint-plugin-react');
const globals = require('globals');

/**
 * @type {import('eslint').Linter.FlatConfig[]}
 */
module.exports = [
  // 全局基础配置
  {
    ignores: [
      'dist/**',
      '.next/**',
      'node_modules/**',
      // 忽略Next.js生成的文件
      'src/renderer/.next/**',
    ],
  },
  // JavaScript 基础推荐规则
  js.configs.recommended,
  // Node.js环境配置 (CommonJS)
  {
    files: [
      'scripts/**/*.js',
      'config/**/*.js',
      '*.js',
      'electron-builder.js',
      '.eslintrc.js',
      'src/renderer/next.config.js',
    ],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'writable',
        require: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'warn',
      'no-useless-escape': 'warn',
    },
  },
  // 浏览器环境配置
  {
    files: [
      'src/renderer/**/*.ts',
      'src/renderer/**/*.tsx',
      'src/renderer/**/*.js',
      'src/renderer/**/*.jsx',
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        window: 'readonly',
        document: 'readonly',
      },
    },
  },
  // Electron主进程配置
  {
    files: ['src/main/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Electron: 'readonly',
      },
    },
  },
  // TypeScript 基本配置
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
    },
    rules: {
      // 基本规则
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // 降低无用转义字符的严重性
      'no-useless-escape': 'warn',
      // 针对共享类型文件的特殊规则
      'no-unused-vars': 'off',
    },
  },
  // React 基础配置
  {
    files: ['**/*.tsx', '**/*.jsx'],
    plugins: {
      react: reactPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
  // 主进程特殊配置
  {
    files: ['src/main/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  // 类型定义文件特殊规则
  {
    files: ['**/*.d.ts'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  // 共享类型文件特殊规则
  {
    files: ['src/shared/**/*.ts'],
    rules: {
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
