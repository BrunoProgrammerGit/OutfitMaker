import { beforeEach, describe, expect, it, vi } from 'vitest'
import { openDB } from 'idb'
import { encryptSilhouettePayload, decryptSilhouettePayload } from './silhouetteCrypto.js'
import { getSilhouette, saveSilhouette } from './silhouetteStorage.js'

vi.mock('idb', () => ({ openDB: vi.fn() }))

class FakeWorker {
  constructor() {
    this.listeners = {}
  }

  addEventListener(type, callback) {
    this.listeners[type] = callback
  }

  removeEventListener(type) {
    delete this.listeners[type]
  }

  postMessage(message) {
    const { type, payload, user, options } = message

    if (type === 'encrypt') {
      encryptSilhouettePayload(payload, user, options).then((result) => {
        this.listeners.message?.({ data: { ok: true, result } })
      })
      return
    }

    if (type === 'decrypt') {
      decryptSilhouettePayload(payload, user, options).then((result) => {
        this.listeners.message?.({ data: { ok: true, result } })
      })
    }
  }
}

describe('silhouette storage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    const records = new Map()
    const db = {
      put: vi.fn(async (_store, value) => {
        records.set(value.id, value)
        return value
      }),
      get: vi.fn(async (_store, key) => records.get(key) ?? null),
      delete: vi.fn(async (_store, key) => {
        records.delete(key)
      }),
    }

    openDB.mockResolvedValue(db)

    Object.defineProperty(globalThis, 'Worker', {
      configurable: true,
      value: FakeWorker,
    })

    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: { persist: vi.fn().mockResolvedValue(true) },
    })
  })

  it('saves and restores an encrypted silhouette locally', async () => {
    const user = { id: 'user-1', email: 'test@example.com' }
    const image = 'data:image/png;base64,abc123'

    const saveResult = await saveSilhouette(image, user)
    const restored = await getSilhouette(user)

    expect(saveResult).toEqual({ ok: true })
    expect(restored).toBe(image)
    expect(navigator.storage.persist).toHaveBeenCalledTimes(1)
  })
})
