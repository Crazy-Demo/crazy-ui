import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

const pkgsDir = resolve(__dirname, '../../packages');
const root = resolve(__dirname, '../..');

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@crazy-ui/components': resolve(pkgsDir, 'components/src'),
    },
    conditions: ['development'],
  },
  server: {
    fs: {
      allow: [root],
    },
  },
});
