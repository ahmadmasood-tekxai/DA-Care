/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_UPLOADS_BASE_URL: string;
  readonly VITE_WHATSAPP_NUMBER_1: string;
  readonly VITE_WHATSAPP_NUMBER_2: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
