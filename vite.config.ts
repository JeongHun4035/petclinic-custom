import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    cacheDir: './.vite-cache',

    plugins: [react()],

    resolve: {
      conditions: ['browser'],
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
        '~': path.resolve(import.meta.dirname, './src'),
      },
    },

    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: pathValue => pathValue.replace(/^\/api/, ''),
        },
      },
    },
    optimizeDeps: {
      include: ['axios'],
    },
  }
})