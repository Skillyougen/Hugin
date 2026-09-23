import Icon from '../ui/Icon'

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <span className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-brand text-white">
        <Icon name="Feather" size={13} />
      </span>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-surface-border bg-surface-card px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" />
      </div>
    </div>
  )
}
