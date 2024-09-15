import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({ imports: ['vue', 'vuex'] }),
    Components({
      dirs: ['./src'],
    }),
  ],
  server: {
    port: 8080,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
