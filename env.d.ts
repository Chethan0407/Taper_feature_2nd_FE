/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_ORIGIN?: string
  /** Full URL or path override for POST UI events (default: /api/v1/auth/ui-events). */
  readonly VITE_UI_TELEMETRY_URL?: string
  /** Set to 1 or true to turn off client UI telemetry. */
  readonly VITE_DISABLE_UI_TELEMETRY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
} 