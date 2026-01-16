import fs from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import {defineConfig, loadEnv} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
import tsConfigPaths from 'vite-tsconfig-paths';
import z from 'zod';

const EnvSchema = z.object({
  REVISION: z.string().min(1),
  API_URL: z.url(),
  DEVSERVER_HOSTNAME: z.string().default('localhost'),
  DEVSERVER_PORT: z.coerce.number().min(1024).max(65_535).default(31_234),
});

export default defineConfig(({mode}) => {
  const {REVISION, API_URL, DEVSERVER_PORT, DEVSERVER_HOSTNAME} =
    EnvSchema.parse(loadEnv(mode, process.cwd(), ''));

  return {
    define: {
      REVISION: JSON.stringify(REVISION),
      API_URL: JSON.stringify(API_URL),
    },
    resolve: {
      alias: {
        '@/': import.meta.resolve('.'),
      },
    },
    build: {
      outDir: 'build',
    },
    server: {
      open: true,
      port: DEVSERVER_PORT,
      https: {
        key: fs.readFileSync(path.resolve(__dirname, './localhost-key.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, './localhost.pem')),
      },
      // Make sure the server is accessible over the local network
      host: DEVSERVER_HOSTNAME,
    },
    plugins: [
      tsConfigPaths(),
      react(),
      VitePWA({
        devOptions: {
          /* enable sw on development */
          enabled: true,
          type: 'module',
          /* other options */
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
              },
            },
          ],
        },
        manifest: {
          lang: 'uk',
          name: 'Списки', // 👈 Use package.json, README.md or something like that
          short_name: 'listock', // 👈 Use package.json, README.md or something like that
          description: 'Менеджер списків', // 👈 Use package.json, README.md or something like that
          theme_color: '#ffffff', // 👈 Use MUI theme defined values
          background_color: '#ffffff', // 👈 Use MUI theme defined values
          display: 'standalone',
          icons: [
            {
              src: '/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
  };
});
