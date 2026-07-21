import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: { //배포 없이 로컬에서도 API 테스트 가능하게 하기 위함
      proxy: {
        '/api': {
          target: 'https://piccup-api.onrender.com',
          changeOrigin: true,
          secure: true,
        }
      }
    }
})