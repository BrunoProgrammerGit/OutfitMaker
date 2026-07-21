import { encryptSilhouettePayload, decryptSilhouettePayload } from './silhouetteCrypto.js'

self.onmessage = async (event) => {
  const { type, payload, user, options } = event.data ?? {}

  try {
    if (type === 'encrypt') {
      const result = await encryptSilhouettePayload(payload, user, options)
      self.postMessage({ ok: true, result })
      return
    }

    if (type === 'decrypt') {
      const result = await decryptSilhouettePayload(payload, user, options)
      self.postMessage({ ok: true, result })
      return
    }

    self.postMessage({ ok: false, error: 'unsupported-worker-action' })
  } catch (error) {
    self.postMessage({ ok: false, error: error?.message ?? 'silhouette-worker-error' })
  }
}
