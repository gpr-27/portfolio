import { defineConfig, loadEnv, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const ROOT = dirname(fileURLToPath(import.meta.url))

// Relative base on build → deploys to any path (Render static serve, GH Pages subpath).
// In dev, a tiny middleware serves POST /api/chat and /api/contact using
// backend/lib/{chat-core,contact-core}.ts and the real keys from the root .env —
// so `npm run dev` gives the genuine LLM assistant, not the offline fallback.
// Secrets stay server-side (never sent to the client).
// https://vite.dev/config/
export default defineConfig(({ command: _command, mode }) => {
  const env = loadEnv(mode, ROOT, '')

  return {
    root: resolve(ROOT, 'frontend'),
    envDir: ROOT,
    base: './',
    plugins: [
      react(),
      {
        name: 'dev-api',
        configureServer(server: ViteDevServer) {
          server.middlewares.use((req, res, next) => {
            const url = (req.url || '').split('?')[0]
            if (req.method !== 'POST' || (url !== '/api/chat' && url !== '/api/contact')) {
              return next()
            }
            let raw = ''
            req.on('data', (c) => (raw += c))
            req.on('end', async () => {
              try {
                const body = raw ? JSON.parse(raw) : {}
                let out
                if (url === '/api/chat') {
                  const mod = await server.ssrLoadModule(resolve(ROOT, 'backend/lib/chat-core.ts'))
                  out = await mod.handleChat(body, env)
                } else {
                  const mod = await server.ssrLoadModule(resolve(ROOT, 'backend/lib/contact-core.ts'))
                  out = await mod.handleContact(body, env)
                }
                res.setHeader('content-type', 'application/json')
                res.statusCode = 200
                res.end(JSON.stringify(out))
              } catch {
                res.statusCode = 500
                res.end(JSON.stringify({ error: 'dev api failed' }))
              }
            })
          })
        },
      },
    ],
    build: {
      outDir: resolve(ROOT, 'dist'),
      emptyOutDir: true,
    },
    server: {
      port: 5180,
      strictPort: true,
      fs: {
        allow: [ROOT],
      },
    },
  }
})
