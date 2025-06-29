import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Vitest 将在 tests 目录中查找项目配置
    projects: ['./tests/main/vitest.config.ts', './tests/renderer/vitest.config.ts'],
  },
});
