import { useEffect, useRef } from 'react'

/**
 * Aplica un desplazamiento vertical suave basado en el scroll para efecto
 * parallax de scrapbook. speed > 0 mueve más lento que el contenido.
 */
export default function useParallax(speed = 0.2) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        el.style.transform = `translate3d(0, ${window.scrollY * -speed}px, 0)`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [speed])

  return ref
}
