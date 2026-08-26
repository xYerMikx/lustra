/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_APP_URL?: string
  readonly PUBLIC_YANDEX_METRIKA_ID?: string
  readonly PUBLIC_GA_MEASUREMENT_ID?: string
  readonly PUBLIC_GOOGLE_SITE_VERIFICATION?: string
  readonly PUBLIC_YANDEX_METRIKA_WEBVISOR?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.woff2?url' {
  const src: string
  export default src
}

  const src: string
  export default src
}
