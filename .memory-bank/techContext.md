# 技术环境与配置

## 开发环境

- **Node.js**: v18.x 或更高版本
- **包管理器**: Bun v1.2.16
- **开发 IDE**: VS Code (推荐)

## 技术栈详情

### 核心框架

- **Electron**: v24.1.2 - 跨平台桌面应用框架
- **Next.js**: v13.3.0 - React 应用开发框架
- **React**: v18.2.0 - UI 库
- **TypeScript**: v5.0.4 - 类型安全的 JavaScript 超集

### 样式与 UI

- **TailwindCSS**: v3.3.1 - 实用优先的 CSS 框架
- **Headless UI**: v1.7.13 - 无样式组件库
- **Heroicons**: v2.0.17 - SVG 图标集

### 主进程工具

- **Electron Store**: v8.1.0 - 数据持久化
- **Electron Next**: v3.1.5 - Next.js 与 Electron 集成
- **Subtitle**: v4.2.1 - 字幕文件解析库

### 开发工具

- **ESLint**: v9.29.0 - 代码质量工具
- **Jest**: v30.0.2 - 测试框架
- **Concurrently**: v9.1.2 - 并行执行命令
- **Cross-env**: v7.0.3 - 跨平台环境变量

## 项目结构

```
words-via-subtitle/
├── assets/               # 静态资源
├── config/               # 配置文件
├── dist/                 # 构建输出
├── docs/                 # 文档
├── public/               # 公共资源
├── src/
│   ├── main/             # Electron主进程代码
│   │   ├── services/     # 主进程服务
│   │   └── utils/        # 主进程工具函数
│   ├── renderer/         # Next.js渲染进程代码
│   │   ├── components/   # UI组件
│   │   ├── hooks/        # React Hooks
│   │   ├── pages/        # Next.js页面
│   │   └── styles/       # 样式文件
│   └── shared/           # 共享代码
│       ├── constants/    # 常量
│       ├── types/        # 类型定义
│       └── utils/        # 共享工具函数
├── eslint.config.js      # ESLint v9 扁平配置
├── electron-tsconfig.json # Electron TypeScript配置
├── package.json          # 项目依赖配置
├── tailwind.config.js    # Tailwind配置
└── tsconfig.json         # TypeScript配置
```

## 构建与开发脚本

- **开发模式**: `bun run dev` - 并行启动 Electron 和 Next.js 开发服务器
- **构建**: `bun run build` - 构建生产版本
- **代码检查**: `bun run lint` - 运行 ESLint v9 代码检查
- **测试**: `bun run test` - 运行 Jest 测试

## 外部依赖

- **操作系统**: Windows, macOS, Linux
- **本地存储**: electron-store 用于数据持久化
- **网络请求**: 用于在线词典 API 调用
