import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite dev-server proxies. These let the browser make same-origin requests
// to localhost, which Vite then forwards to Polymarket. This avoids:
//   • CORS rejections on the Gamma & CLOB REST APIs (no Access-Control-Allow-Origin)
//   • Origin-based WebSocket rejections on the CLOB market feed
// In production, point the app at the real domains (or your own backend
// proxy) — these dev proxies only run under `npm run dev`.
export default defineConfig({
  // Must be the *path* (not a full URL) under which the site is served.
  // For https://developerpawanmaurya.github.io/PolyAgent/, base is "/PolyAgent/".
  // Case-sensitive — must match the GitHub repo name exactly.
  base: '/PolyAgent/',
  plugins: [react()],
  build: {
    outDir: 'docs',
  },
  server: {
    proxy: {
      // Gamma REST API — markets, events, metadata
      '/api/gamma': {
        target: 'https://gamma-api.polymarket.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/gamma/, ''),
      },
      // CLOB REST API — prices, order books, history
      '/api/clob': {
        target: 'https://clob.polymarket.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/clob/, ''),
      },
      // CLOB WebSocket — live market feed
      '/ws-polymarket': {
        target: 'wss://ws-subscriptions-clob.polymarket.com',
        ws: true,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/ws-polymarket/, ''),
      },
    },
  },
})
