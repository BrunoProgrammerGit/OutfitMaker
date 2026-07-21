import { useCallback, useEffect, useState } from 'react'
import { getSilhouette, hasSilhouette, saveSilhouette } from './silhouetteStorage.js'

export function useSaveSilhouette() {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  const save = useCallback(async (imageDataUrl, user) => {
    setIsSaving(true)
    setError(null)

    try {
      await saveSilhouette(imageDataUrl, user)
      return true
    } catch (err) {
      setError(err)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  return { save, isSaving, error }
}

export function useGetSilhouette(user) {
  const [silhouette, setSilhouette] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    setError(null)

    getSilhouette(user)
      .then((value) => {
        if (mounted) {
          setSilhouette(value)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err)
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [user])

  return { silhouette, isLoading, error }
}

export function useHasSilhouette() {
  const [hasValue, setHasValue] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    hasSilhouette()
      .then((value) => {
        if (mounted) {
          setHasValue(value)
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return { hasValue, isLoading }
}
