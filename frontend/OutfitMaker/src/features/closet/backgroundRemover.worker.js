import { removeBackground, preload } from '@imgly/background-removal'

// Worker message protocol:
// main -> { type: 'process', id, file, config? }
// worker -> { type: 'progress', id, stage, current, total }
// worker -> { type: 'done', id, blob }
// worker -> { type: 'error', id, message }

self.onmessage = async (ev) => {
  const { data } = ev
  if (!data || data.type !== 'process') return
  const { id, file, config = {} } = data

  try {
    // Best-effort preload of runtime assets
    try { await preload(config) } catch (e) { /* ignore */ }

    const progress = (stage, current, total) => {
      self.postMessage({ type: 'progress', id, stage, current, total })
    }

    const result = await removeBackground(file, { ...config, progress })

    if (!result) throw new Error('No result from background removal')

    let outBlob = null
    if (result instanceof Blob) outBlob = result
    else if (result.blob instanceof Blob) outBlob = result.blob
    else if (result instanceof ArrayBuffer) outBlob = new Blob([result], { type: 'image/png' })
    else if (result.data && result.width && result.height) {
      const canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(result.width, result.height) : null
      if (!canvas) throw new Error('No OffscreenCanvas available to convert result')
      const ctx = canvas.getContext('2d')
      const imageData = new ImageData(new Uint8ClampedArray(result.data), result.width, result.height)
      ctx.putImageData(imageData, 0, 0)
      outBlob = await canvas.convertToBlob({ type: 'image/png' })
    }

    if (!outBlob) throw new Error('Unable to convert result to Blob')

    self.postMessage({ type: 'done', id, blob: outBlob })
  } catch (err) {
    self.postMessage({ type: 'error', id, message: err?.message || String(err) })
  }
}
