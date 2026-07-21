const SILHOUETTE_SALT_KEY = 'om.silhouette.salt'
const DEFAULT_ITERATIONS = 250000

function encodeSalt(bytes) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64')
  }

  return btoa(String.fromCharCode(...bytes))
}

function normalizeSaltToBytes(salt) {
  if (salt instanceof Uint8Array) {
    return salt
  }

  if (typeof salt === 'string') {
    if (typeof Buffer !== 'undefined') {
      try {
        return new Uint8Array(Buffer.from(salt, 'base64'))
      } catch {
        // Fallback to UTF-8 bytes for non-base64 strings.
      }
    }

    return new TextEncoder().encode(salt)
  }

  return new TextEncoder().encode('default-silhouette-salt')
}

function getUserSeed(user) {
  if (!user) {
    return 'anonymous-user'
  }

  const candidates = [user.id, user.email, user.username, user.name, user.userId]
  const selected = candidates.find((value) => typeof value === 'string' && value.trim().length > 0)

  return selected ?? 'anonymous-user'
}

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }

  return null
}

export function getSilhouetteSalt(storage = getStorage()) {
  if (storage) {
    const existing = storage.getItem(SILHOUETTE_SALT_KEY)
    if (existing) {
      return existing
    }
  }

  const nextSalt = crypto.getRandomValues(new Uint8Array(16))
  const encoded = encodeSalt(nextSalt)

  if (storage) {
    storage.setItem(SILHOUETTE_SALT_KEY, encoded)
  }

  return encoded
}

export async function deriveSilhouetteKey(user, salt) {
  const normalizedSalt = typeof salt === 'string' ? salt : getSilhouetteSalt()
  const saltBytes = normalizeSaltToBytes(normalizedSalt)
  const baseKeyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getUserSeed(user)),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: DEFAULT_ITERATIONS,
      hash: 'SHA-256'
    },
    baseKeyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptSilhouettePayload(payload, user, options = {}) {
  const salt = options.salt ?? getSilhouetteSalt()
  const iv = options.iv ?? crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveSilhouetteKey(user, salt)
  const encoded = new TextEncoder().encode(payload)
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)

  return {
    ciphertext: Array.from(new Uint8Array(ciphertext)),
    iv: Array.from(iv),
    salt: typeof salt === 'string' ? salt : encodeSalt(salt)
  }
}

export async function decryptSilhouettePayload(encryptedPayload, user, options = {}) {
  const salt = options.salt ?? encryptedPayload?.salt
  const iv = options.iv ?? encryptedPayload?.iv
  const ciphertext = options.ciphertext ?? encryptedPayload?.ciphertext
  const key = await deriveSilhouetteKey(user, salt)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    new Uint8Array(ciphertext)
  )

  return new TextDecoder().decode(decrypted)
}
