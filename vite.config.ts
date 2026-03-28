import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change this to your GitHub repo name when deploying
// e.g. if repo is github.com/username/slot-watch, set base: '/slot-watch/'
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
