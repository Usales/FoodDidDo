import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, normalizePath } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const catalogDir = path.resolve(rootDir, './catalogo-mercado')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.resolve(catalogDir, 'images/*')),
          // ficará acessível como /catalogo-mercado/images/<arquivo>
          dest: 'catalogo-mercado/images'
        }
      ]
    })
  ]
})
