import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
/*
export default defineConfig({
  plugins: [react()],
})
*/
export default defineConfig({
  build: {
    outDir: 'dist', // Vercel이 찾고 있는 이름과 일치시키기
  }
})