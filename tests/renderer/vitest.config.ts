import { defineConfig, mergeConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import rootConfig from '../../vitest.config';

export default mergeConfig(
  rootConfig,
  defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
      include: ['./**/*.test.{ts,tsx}'],
      environment: 'jsdom',
      globals: true,
      setupFiles: [new URL('../../tests/setup.ts', import.meta.url).pathname],
    },
    resolve: {
      alias: {
        '@shared': new URL('../../src/shared', import.meta.url).pathname,
        '@main': new URL('../../src/main', import.meta.url).pathname,
        '@renderer': new URL('../../src/renderer', import.meta.url).pathname,
      },
    },
  })
);
