import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  preview: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      shared: path.resolve(__dirname, './src/components'),
      assets: path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    origin: "http://0.0.0.0:5173",
    watch: {
      usePolling: true
    }
  },
})
