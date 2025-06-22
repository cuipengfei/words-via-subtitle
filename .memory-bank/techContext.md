# 技术环境与配置

## 1. 核心技术栈

- **框架**: [Electron](https://www.electronjs.org/) 用于桌面应用程序外壳。
- **UI 框架**: [Next.js](https://nextjs.org/) (配合 React) 用于构建渲染进程的用户界面。这允许在 Electron 应用中使用现代的基于网页的界面。
- **语言**: [TypeScript](https://www.typescriptlang.org/) 用于主进程和渲染进程的类型安全。
- **样式**: [Tailwind CSS](https://tailwindcss.com/) 用于实用优先的 CSS 样式设计。

## 2. 开发与构建环境

- **包管理器**: `bun` 是本项目唯一的包管理器。所有依赖管理和脚本执行 (`bun install`, `bun run <script>`) 必须使用 `bun`。
- **打包/编译工具**:
    - `tsc` (TypeScript 编译器) 用于编译 Electron 主进程代码 (`electron-tsconfig.json`)。
    - `next build` 处理渲染进程的打包和编译。
- **测试**:
    - [Vitest](https://vitest.dev/) 是主进程和渲染进程的测试框架。
    - 配置文件: `vitest.config.ts` (根目录), `vitest.main.config.ts` (主进程), `tests/renderer/vitest.config.ts` (渲染进程)。
    - 库: `@testing-library/react` 用于组件测试, `jsdom` 用于 DOM 仿真。
- **代码检查**:
    - [ESLint](https://eslint.org/) 用于代码检查，通过 `eslint.config.js` 配置。
    - 验证脚本 `scripts/verify-eslint.js` 确保配置完整性。

## 3. 关键依赖

### 主进程 (Electron)
- `electron`: 桌面应用的核心框架。
- `electron-builder`: 用于打包和分发应用程序。
- `electron-store`: 用于持久化数据存储（例如，用户设置）。
- `electron-is-dev`: 检查应用程序是否在开发环境中运行。
- `electron-next`: Electron 和 Next.js 之间的连接桥梁。

### 渲染进程 (Next.js / React)
- `next`: React 框架。
- `react`, `react-dom`: 核心 React 库。
- `subtitle`: 用于解析 `.srt` 和 `.vtt` 字幕文件的库。
- `bing-translate-api`: 用于获取单词翻译。
- UI 组件和库:
    - `@headlessui/react`, `@heroicons/react`, `lucide-react`: 用于 UI 组件和图标。
    - `react-resizable-panels`: 用于创建可调整大小的布局。
    - `react-perfect-scrollbar`: 用于自定义滚动条。

## 4. 项目结构

- `src/main/`: 包含所有 Electron 主进程源代码。
- `src/renderer/`: 包含所有 Next.js 渲染进程源代码（页面、组件、hooks）。
- `src/shared/`: 包含主进程和渲染进程之间共享的代码（例如，IPC 合同、共享类型）。
- `tests/`: 包含所有测试文件，按 `main`、`renderer` 和 `e2e` 子目录组织。
- `scripts/`: 包含开发和构建过程中的辅助脚本。
- `.memory-bank/`: 包含所有项目文档和 AI 助手的上下文。
