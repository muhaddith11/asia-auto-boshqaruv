import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    env: {
      AUTH_SECRET: 'test-auth-secret',
      OWNER_PASSWORD: 'test-owner-password',
      BOSS_PASSWORD: 'test-boss-password',
      PARTNER_PASSWORD: 'test-partner-password',
      WORKER_PASSWORD: 'test-worker-password',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});
