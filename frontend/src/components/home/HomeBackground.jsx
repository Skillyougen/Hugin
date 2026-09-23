/**
 * Fond animé de l'accueil : deux blobs flous bleu/vert qui dérivent
 * lentement. Atténué en quart de nuit, figé sous prefers-reduced-motion.
 */
export default function HomeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -left-[25%] -top-[35%] aspect-square w-[90vmax] rounded-full bg-ocean-300 opacity-35 blur-3xl dark:bg-ocean-700 dark:opacity-25"
        style={{ animation: 'hg-blob-a 22s ease-in-out infinite' }}
      />
      <div
        className="absolute -bottom-[40%] -right-[25%] aspect-square w-[90vmax] rounded-full bg-mint-300 opacity-35 blur-3xl dark:bg-mint-700 dark:opacity-20"
        style={{ animation: 'hg-blob-b 26s ease-in-out infinite' }}
      />
    </div>
  )
}
