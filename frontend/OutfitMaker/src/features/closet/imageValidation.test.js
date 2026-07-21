import { describe, expect, it } from 'vitest'
import { validateGarmentImage } from './imageValidation'

describe('validateGarmentImage', () => {
  it('accepts a valid image file', async () => {
    const file = new File([new Array(25000).fill('x').join('')], 'prenda.png', { type: 'image/png' })
    const result = await validateGarmentImage(file)

    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('rejects unsupported image formats', async () => {
    const file = new File(['image-bytes'], 'prenda.gif', { type: 'image/gif' })
    const result = await validateGarmentImage(file)

    expect(result.valid).toBe(false)
    expect(result.error).toContain('Formato')
  })

  it('rejects files that are too small', async () => {
    const file = new File(['x'], 'prenda.jpg', { type: 'image/jpeg' })
    const result = await validateGarmentImage(file)

    expect(result.valid).toBe(false)
    expect(result.error).toContain('mínimo')
  })
})
