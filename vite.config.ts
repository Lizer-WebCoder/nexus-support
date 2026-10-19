import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Needed for GitHub Pages (repo name as base path)
  base: '/nexus-support/',
})
