import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import viteCompression from 'vite-plugin-compression'

// 在 ESM 中获取 __dirname 的替代方案
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5180,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    tailwindcss(),
    vue(),
    viteCompression({
      verbose: true,  // 显示压缩日志
      disable: false, // 是否禁用
      threshold: 102400, // 大于 100KB 的文件才压缩
      algorithm: 'gzip', // 压缩算法
      ext: '.gz', // 文件扩展名
    }),
  ],
})
