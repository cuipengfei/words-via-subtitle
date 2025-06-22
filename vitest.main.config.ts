import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/main/**/*.test.ts', 'tests/**/*.main.test.ts'],
    exclude: [
      'tests/renderer/**/*.test.ts',
      'tests/**/*.renderer.test.ts',
      'tests/e2e/**/*',
      'node_modules/**/*',
    ],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      include: ['src/main/**/*'],
      exclude: ['src/renderer/**/*'],
    },
  },
  resolve: {
    alias: {
      '@main': path.resolve(__dirname, 'src/main'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
    },
  },
});
