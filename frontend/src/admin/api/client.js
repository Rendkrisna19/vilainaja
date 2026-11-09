import { ApiError, createClient } from '../../lib/http'

// Klien khusus admin: token disimpan di kunci tersendiri (terpisah dari sesi pelanggan).
const client = createClient({ tokenKey: 'vila_admin_token' })

export const api = client.api
export const tokenStore = client.tokenStore
export const onUnauthorized = client.onUnauthorized
export { ApiError }
