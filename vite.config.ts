import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function AssetResolver() {
  return {
    name: 'asset-resolver',
    resolveId(id) {
      if (id.startsWith('project:asset/')) {
        const filename = id.replace('project:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    AssetResolver(),

    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {

      '@': path.resolve(__dirname, './src'),
    },
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],
})
