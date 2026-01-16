import {defineConfig} from 'vitest/config';

const config = defineConfig({
  define: {
    REVISION: JSON.stringify('vitest'),
    API_URL: JSON.stringify('http://api-server/'),
  },
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
