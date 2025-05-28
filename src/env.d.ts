/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly MAILERLITE_API_KEY: string
  readonly MAILERLITE_GROUP_ID: string
  readonly PUBLIC_GA_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
