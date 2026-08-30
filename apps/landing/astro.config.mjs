import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://lumira.by',
  trailingSlash: 'ignore',
  server: {
    port: 4321,
  },
  build: {
    inlineStylesheets: 'always',
  },
})
