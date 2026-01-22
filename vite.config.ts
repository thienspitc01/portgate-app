
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ưu tiên API_KEY từ môi trường build của Vercel
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || process.env.GEMINI_API_KEY || '')
  }
});
