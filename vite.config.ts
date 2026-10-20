import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Always use /nexus-support/ on CI so GitHub Pages asset paths work.
// Local `npm run dev` still uses `/`.
const base =
  process.env.GITHUB_ACTIONS === 'true' || process.env.FORCE_GH_PAGES_BASE === 'true'
    ? '/nexus-support/'
    : '/'

export default defineConfig({
  plugins: [react()],
  base,
})
