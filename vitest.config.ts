import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: ['src/**/*.test.{ts,tsx}'],
      exclude: [...configDefaults.exclude, '**/.worktrees/**', '**/.claude/**'],
    },
  }),
);
