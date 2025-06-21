# ESLint 配置指南

本项目使用 ESLint v9 的扁平配置格式，通过`eslint.config.js`文件进行配置，为不同类型的文件和代码区域设置了特定的规则。

## 配置概览

配置文件结构如下：

```js
module.exports = [
  // 基础配置
  { ignores: ['dist/**', '.next/**', 'node_modules/**', 'src/renderer/.next/**'] },

  // JavaScript 基础规则
  js.configs.recommended,

  // Node.js环境配置
  {
    /* Node.js相关配置 */
  },

  // 浏览器环境配置
  {
    /* 浏览器相关配置 */
  },

  // Electron主进程配置
  {
    /* Electron主进程相关配置 */
  },

  // TypeScript基本配置
  {
    /* TypeScript相关配置 */
  },

  // React基础配置
  {
    /* React相关配置 */
  },

  // 其他特殊规则
  {
    /* 特殊文件规则 */
  },
];
```

## 如何运行 ESLint 检查

使用以下命令运行 ESLint 检查：

```bash
# 检查整个项目
bun run lint

# 只显示错误，不显示警告
bun run lint --quiet

# 检查特定文件或目录
bun run lint src/main
bun run lint src/renderer
bun run lint src/shared/ipc.ts
```

## 规则集说明

1. **主进程规则**：

   - 允许使用`console`
   - 设置 Node.js 环境全局变量
   - 适用于`src/main/**/*.ts`文件

2. **渲染进程规则**：

   - 设置浏览器环境全局变量
   - 适用于`src/renderer/**/*.ts`和`src/renderer/**/*.tsx`文件

3. **共享代码规则**：

   - 严格类型检查
   - 适用于`src/shared/**/*.ts`文件

4. **类型定义文件规则**：
   - 放宽未使用变量检查
   - 适用于`**/*.d.ts`文件

## 如何扩展配置

如需添加新的规则或修改现有规则，请编辑`eslint.config.js`文件，按照 ESLint v9 的扁平配置格式进行修改。

```js
// 添加新的规则集示例
{
  files: ['path/to/files/**/*.ts'],
  rules: {
    'rule-name': 'error', // 或 'warn' 或 'off'
  }
}
```

## 参考资源

- [ESLint v9 文档](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [@typescript-eslint 文档](https://typescript-eslint.io/docs/)
