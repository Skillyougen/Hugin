import { useEffect, useState } from 'react'

/**
 * Quart de nuit à bord : 23 h – 6 h. Pour la démo, `?nuit=1` force le mode
 * nuit et `?nuit=0` le désactive, quelle que soit l'heure.
 */
export function isNightShift(date = new Date()) {
  const forced = new URLSearchParams(window.location.search).get('nuit')
  if (forced === '1') return true
  if (forced === '0') return false
  const h = date.getHours()
  return h >= 23 || h < 6
}

export function useNightShift() {
  const [night, setNight] = useState(isNightShift)
  useEffect(() => {
    const id = setInterval(() => setNight(isNightShift()), 60_000)
    return () => clearInterval(id)
  }, [])
  return night
}
