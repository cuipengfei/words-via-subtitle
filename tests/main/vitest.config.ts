import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ['./**/*.test.{ts,tsx}'],
    environment: 'node',
    globals: true,
    setupFiles: [new URL('../setup.ts', import.meta.url).pathname],
  },
  resolve: {
    alias: {
      '@shared': new URL('../../src/shared', import.meta.url).pathname,
      '@main': new URL('../../src/main', import.meta.url).pathname,
      '@renderer': new URL('../../src/renderer', import.meta.url).pathname,
    },
  },
});
