const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MIN_SIZE_BYTES = 20_000

export async function validateGarmentImage(file) {
  if (!file) {
    return { valid: false, error: 'Selecciona una imagen para subir.' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Formato no soportado. Usa JPG, PNG o WebP.' }
  }

  if (file.size < MIN_SIZE_BYTES) {
    return { valid: false, error: 'La imagen es demasiado pequeña. Prueba con una mejor calidad y un tamaño mínimo de 20 KB.' }
  }

  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      resolve({ valid: true })
      return
    }

    const image = new Image()
    const objectUrl = typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : ''

    const finalize = (valid, error) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      resolve({ valid, error })
    }

    if (objectUrl) {
      image.onload = () => {
        const isValid = image.width >= 120 && image.height >= 120
        finalize(
          isValid,
          isValid
            ? undefined
            : 'La imagen parece borrosa o demasiado pequeña. Sube una foto más nítida y con al menos 120x120 px.',
        )
      }
      image.onerror = () => finalize(false, 'No se pudo leer la imagen. Intenta con otra foto.')
      image.src = objectUrl

      setTimeout(() => {
        if (image.complete) return
        finalize(true)
      }, 120)
      return
    }

    finalize(true)
  })
}
