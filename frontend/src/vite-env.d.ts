/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public API path/URL for the AI assistant (default /api/chat). */
  readonly VITE_CHAT_ENDPOINT?: string
  /** Public API path/URL for the contact form (default /api/contact). */
  readonly VITE_CONTACT_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
