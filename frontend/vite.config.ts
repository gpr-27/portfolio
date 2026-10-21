import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, /api goes to the backend service (npm run dev in backend/, port 3000).
// On Vercel, vercel.json routes /api to the backend service instead.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    proxy: { '/api': 'http://localhost:3000' },
  },
})
