/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_UPLOADS_BASE_URL?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_WHATSAPP_NUMBER_1?: string;
  readonly VITE_WHATSAPP_NUMBER_2?: string;
  readonly VITE_SUPPORT_EMAIL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_MEEZAN_TITLE?: string;
  readonly VITE_MEEZAN_ACCOUNT?: string;
  readonly VITE_MASHREQ_TITLE?: string;
  readonly VITE_MASHREQ_ACCOUNT?: string;
  readonly VITE_MASHREQ_IBAN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
