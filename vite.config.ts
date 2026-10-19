import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Use '/' for Vercel / Netlify / most hosts.
  // For GitHub Pages you can temporarily set base: '/nexus-support/'
  base: '/',
})
