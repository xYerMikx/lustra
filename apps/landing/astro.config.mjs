import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://lumira.by',
  trailingSlash: 'always',
  server: {
    port: 4321,
  },
  build: {
    inlineStylesheets: 'always',
  },
})
