import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'SAE Audition Portal',
        short_name: 'SAE Auditions',
        description: 'Society of Automotive Engineers Virtual Audition Tool',
        theme_color: '#e50914',
        background_color: '#0a0a0a',
        display: 'standalone',
        icons: [
          {
            src: '/saelogo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/saelogo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
