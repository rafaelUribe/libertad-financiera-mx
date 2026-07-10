import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    open: true,
    proxy: {
      // Redirige las llamadas a Netlify Functions al servidor de netlify dev (puerto 8888)
      // Funciona tanto con `npm run dev` como con `netlify dev`
      '/.netlify/functions': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
    },
  },
})
