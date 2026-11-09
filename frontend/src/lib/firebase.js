import { FIREBASE, FIREBASE_ENABLED } from './env'

/**
 * Membuka popup login Google dan mengembalikan Firebase ID token.
 * SDK Firebase dimuat dinamis, jadi tidak membebani halaman yang tidak memakai login Google.
 * Mengembalikan null bila pengguna menutup popup.
 */
export async function googleIdToken() {
  if (!FIREBASE_ENABLED) throw new Error('Login Google belum dikonfigurasi.')

  const [{ initializeApp, getApps }, { getAuth, GoogleAuthProvider, signInWithPopup }] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
  ])

  const app = getApps()[0] ?? initializeApp(FIREBASE)
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  try {
    const result = await signInWithPopup(getAuth(app), provider)
    return await result.user.getIdToken()
  } catch (err) {
    if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') return null
    if (err?.code === 'auth/popup-blocked') throw new Error('Popup diblokir browser. Izinkan popup untuk situs ini.')
    throw new Error('Gagal masuk dengan Google. Coba lagi.')
  }
}
