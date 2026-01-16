import {defineConfig} from 'vitest/config';

const config = defineConfig({
  resolve: {
    alias: {
      '@/': import.meta.resolve('.'),
    },
  },
  test: {
    /**
     * @link https://vitest.dev/api/mock#mockreset
     */
    clearMocks: true,
    /**
     * @link https://vitest.dev/api/mock#mockclear
     */
    mockReset: true,
  },
});

export default config;
