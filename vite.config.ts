import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 8887,
    strictPort: true, // Não muda de porta se 8887 estiver ocupada
    host: true, // Permite acesso externo
  },
})
