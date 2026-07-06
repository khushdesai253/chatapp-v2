import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    nodePolyfills({
      include: ['process', 'events', 'buffer', 'util', 'stream'],
      globals: {
        global: true,
        process: true,
        Buffer: true,
      }
    })
  ],
})
