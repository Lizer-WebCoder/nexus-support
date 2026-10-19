import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves at /nexus-support/; Vercel (and local) serve at /
const isVercel = !!process.env.VERCEL
const isGhPages = process.env.GITHUB_ACTIONS === 'true' && !isVercel

export default defineConfig({
  plugins: [react()],
  base: isGhPages ? '/nexus-support/' : '/',
})
