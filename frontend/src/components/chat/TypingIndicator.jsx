import FoxyAvatar from '../mascot/FoxyAvatar'

/** Foxy réfléchit pendant que la réponse se prépare. */
export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2" aria-live="polite" aria-label="Huginn écrit">
      <FoxyAvatar mood="thinking" />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-surface-border bg-surface-card px-3.5 py-3">
        {[0, 150, 300].map((d) => (
          <span key={d} className="h-1.5 w-1.5 rounded-full bg-text-muted" style={{ animation: `hg-dot 1.2s ease-in-out ${d}ms infinite` }} />
        ))}
      </div>
    </div>
  )
}
