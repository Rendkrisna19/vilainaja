import { ApiError, createClient } from '../../lib/http'

// Klien pelanggan/publik. Token disimpan di kunci sendiri (terpisah dari sesi admin).
const client = createClient({ tokenKey: 'vila_token' })

export const api = client.api
export const tokenStore = client.tokenStore
export const onUnauthorized = client.onUnauthorized
export { ApiError }
