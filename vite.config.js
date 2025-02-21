import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  server: {
    allowedHosts: ['b027-122-166-77-93.ngrok-free.app'], // Add Ngrok host here
  },
})
