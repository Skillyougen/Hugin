import { useEffect, useRef, useState } from 'react'
import Foxy from './Foxy'
import { colon } from '../../mocks/colon'

/**
 * Écran d'ouverture — portage web de la vidéo « Foxy - Video d'ouverture ».
 *
 *   Veille 2,4 s → Réveil 1,6 s → Bonjour 2,8 s → Prêt → fondu vers l'app
 *
 * Clic, Entrée, Espace ou Échap passent l'intro. Sous
 * prefers-reduced-motion, on montre directement l'état final.
 */
const BEATS = [
  [0, 'sleepy'],
  [2400, 'surprised'],
  [4000, 'happy'],
  [6800, 'cheer'],
]
const TOTAL = 8600

const STARS = Array.from({ length: 26 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  top: `${(i * 53 + 7) % 62}%`,
  size: 2 + (i % 3),
  delay: `${(i * 0.37) % 3}s`,
}))

export default function IntroSplash({ onDone }) {
  const [mood, setMood] = useState('sleepy')
  const [day, setDay] = useState(false)
  const [word, setWord] = useState(0) // 0 caché · 1 visible · 2 sorti
  const [hello, setHello] = useState(false)
  const [out, setOut] = useState(false)
  const done = useRef(false)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  const finish = useRef(() => {
    if (done.current) return
    done.current = true
    setOut(true)
    setTimeout(() => onDoneRef.current(), 450)
  }).current

  useEffect(() => {
    const ids = []
    const at = (ms, fn) => ids.push(setTimeout(fn, ms))

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMood('cheer')
      setDay(true)
      setHello(true)
      at(1400, finish)
    } else {
      BEATS.forEach(([ms, m]) => at(ms, () => setMood(m)))
      at(2300, () => setDay(true))
      at(4350, () => setWord(1))
      at(6300, () => setWord(2))
      at(7150, () => setHello(true))
      at(TOTAL, finish)
    }

    const onKey = (e) => {
      if (['Escape', 'Enter', ' '].includes(e.key)) finish()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      ids.forEach(clearTimeout)
      window.removeEventListener('keydown', onKey)
    }
  }, [finish])

  return (
    <div
      role="dialog"
      aria-label="Introduction de Huginn"
      onClick={finish}
      className={`fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center overflow-hidden px-6 transition-[opacity,background-color] ease-out ${out ? 'opacity-0' : 'opacity-100'}`}
      style={{ backgroundColor: day ? '#f5f8fb' : '#0b1220', transitionDuration: out ? '450ms' : '1000ms' }}
    >
      {/* nuit de bord */}
      <div className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${day ? 'opacity-0' : 'opacity-100'}`}>
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[#cfe0ff]"
            style={{ left: s.left, top: s.top, width: s.size, height: s.size, animation: `hg-twinkle 3s ease-in-out ${s.delay} infinite` }}
          />
        ))}
      </div>
      {/* jour de bord */}
      <div className={`pointer-events-none absolute inset-0 transition-opacity delay-200 duration-[1400ms] ${day ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute -left-[30vmax] -top-[30vmax] h-[90vmax] w-[90vmax] rounded-full bg-[radial-gradient(circle,rgba(147,197,253,.55),transparent_65%)]" />
        <div className="absolute -bottom-[30vmax] -right-[30vmax] h-[90vmax] w-[90vmax] rounded-full bg-[radial-gradient(circle,rgba(110,231,183,.5),transparent_65%)]" />
      </div>

      <div className={`relative transition-transform duration-700 ease-out ${day ? 'scale-110' : 'scale-100'}`}>
        <Foxy mood={mood} size={240} />
      </div>

      <div className="relative mt-4 h-32 w-full max-w-md">
        <div
          className="absolute inset-x-0 flex flex-col items-center transition-all duration-700 ease-out"
          style={{ opacity: word === 1 ? 1 : 0, transform: `translateY(${word === 0 ? 20 : word === 2 ? -14 : 0}px)` }}
        >
          <span className="text-5xl font-bold tracking-tight text-[#101826]">Huginn</span>
          <span className="mt-1 text-sm text-[#56657a]">Assistant santé de bord · {colon.ship}</span>
        </div>
        <div
          className="absolute inset-x-0 flex flex-col items-center transition-all duration-700 ease-out"
          style={{ opacity: hello ? 1 : 0, transform: `translateY(${hello ? 0 : 18}px)` }}
        >
          <span className="text-3xl font-semibold text-[#101826]">Bonjour {colon.firstName}</span>
          <span className="mt-1 text-base text-[#56657a]">Comment te sens-tu aujourd’hui ?</span>
        </div>
      </div>

      <span className={`absolute bottom-8 text-xs transition-colors duration-1000 ${day ? 'text-[#8b9aad]' : 'text-[#6b7f99]'}`}>
        Toucher pour passer
      </span>
    </div>
  )
}
