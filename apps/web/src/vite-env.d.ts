/// <reference types="vite/client" />

/** Tipado de nuestras variables de entorno (las que empiezan por VITE_). */
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
