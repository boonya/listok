import {defineConfig} from 'vitest/config';

// TODO: Remove it when at least one test suite is there.
process.exit(0);

const config = defineConfig({
  define: {
    REVISION: JSON.stringify('vitest'),
    API_URL: JSON.stringify('http://vitest-api-server/'),
  },
  resolve: {
    alias: {
      '@/': import.meta.resolve('.'),
    },
  },
  test: {
    globalSetup: '../tests/globals.ts',
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
