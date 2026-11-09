// Semua konfigurasi lingkungan dibaca dari sini. Jangan memakai import.meta.env di tempat lain.
const rawApi = import.meta.env.VITE_API_URL

if (!rawApi && import.meta.env.DEV) {
  console.warn('[env] VITE_API_URL belum diatur di .env — memakai "/api" (same-origin).')
}

export const API_URL = (rawApi || '/api').replace(/\/+$/, '')
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'vilainaja'

// Firebase Authentication (login Google). Semua nilai ada di Firebase Console → Project settings → Your apps (Web).
export const FIREBASE = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}
export const FIREBASE_ENABLED = Boolean(FIREBASE.apiKey && FIREBASE.projectId && FIREBASE.appId)
