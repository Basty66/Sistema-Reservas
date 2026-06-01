import { useState, useEffect, useRef } from 'react'

export default function useAnimatedNumber(target, duration = 600) {
  const [current, setCurrent] = useState(0)
  const startTime = useRef(null)
  const startValue = useRef(0)
  const rafId = useRef(null)

  useEffect(() => {
    startValue.current = current
    startTime.current = null

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(startValue.current + (target - startValue.current) * eased))
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate)
      }
    }

    if (target !== current) {
      rafId.current = requestAnimationFrame(animate)
    }

    return () => { if (rafId.current) cancelAnimationFrame(rafId.current) }
  }, [target, duration])

  return current
}
