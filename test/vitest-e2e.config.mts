import { resolve } from 'node:path';

import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  resolve: {
    alias: { '@': resolve(import.meta.dirname, '../src') },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts'],
    root: resolve(import.meta.dirname, '..'),
  },
});
