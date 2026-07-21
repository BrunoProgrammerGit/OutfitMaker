import { openDB } from 'idb'
import { getSilhouetteSalt } from './silhouetteCrypto.js'

const DB_NAME = 'outfitmaker-db'
const STORE_NAME = 'user-silhouette'

let worker
let workerReadyPromise

function getWorker() {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return null
  }

  if (!worker) {
    worker = new Worker(new URL('./silhouette.worker.js', import.meta.url), { type: 'module' })
  }

  if (!workerReadyPromise) {
    workerReadyPromise = Promise.resolve(true)
  }

  return worker
}

function runInWorker(type, payload, user, options = {}) {
  const activeWorker = getWorker()
  if (!activeWorker) {
    return Promise.reject(new Error('Worker no disponible'))
  }

  return new Promise((resolve, reject) => {
    const onMessage = (event) => {
      const { ok, result, error } = event.data ?? {}
      activeWorker.removeEventListener('message', onMessage)
      if (ok) {
        resolve(result)
      } else {
        reject(new Error(error))
      }
    }

    activeWorker.addEventListener('message', onMessage)
    activeWorker.postMessage({ type, payload, user, options })
  })
}

export async function initSilhouetteStorage() {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })

  return db
}

export async function saveSilhouette(imageDataUrl, user) {
  if (!imageDataUrl) {
    throw new Error('No existe una silueta para guardar')
  }

  if (typeof navigator !== 'undefined' && 'storage' in navigator && 'persist' in navigator.storage) {
    const persisted = await navigator.storage.persist()
    if (!persisted) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('silhouette:recapture-required', {
          detail: { reason: 'storage-persist-denied' },
        }))
      }
      throw new Error('storage-persist-denied')
    }
  }

  const db = await initSilhouetteStorage()
  const salt = getSilhouetteSalt()
  const encrypted = await runInWorker('encrypt', imageDataUrl, user, { salt })

  await db.put(STORE_NAME, {
    id: 'user-silhouette',
    payload: encrypted,
    storedAt: Date.now(),
    salt
  })

  return { ok: true }
}

export async function getSilhouette(user) {
  const db = await initSilhouetteStorage()
  const record = await db.get(STORE_NAME, 'user-silhouette')

  if (!record?.payload) {
    return null
  }

  const decrypted = await runInWorker('decrypt', record.payload, user, {
    salt: record.salt
  })

  return decrypted
}

export async function hasSilhouette() {
  const db = await initSilhouetteStorage()
  const record = await db.get(STORE_NAME, 'user-silhouette')
  return Boolean(record?.payload)
}

export async function clearSilhouette() {
  const db = await initSilhouetteStorage()
  await db.delete(STORE_NAME, 'user-silhouette')
}
