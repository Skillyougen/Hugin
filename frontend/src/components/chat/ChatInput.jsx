import { useState } from 'react'
import Icon from '../ui/Icon'

/**
 * Champ de saisie du chat. `onTypingChange` prévient la page quand le colon
 * tape, pour que Foxy passe « à l'écoute ».
 */
export default function ChatInput({ onSend, onTypingChange, disabled, night }) {
  const [value, setValue] = useState('')
  const canSend = value.trim().length > 0 && !disabled

  function handleChange(e) {
    setValue(e.target.value)
    onTypingChange?.(e.target.value.trim().length > 0)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    onTypingChange?.(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        value={value}
        onChange={handleChange}
        onBlur={() => onTypingChange?.(false)}
        placeholder={night ? 'Écris à voix basse…' : 'Écris un message à Huginn…'}
        disabled={disabled}
        aria-label="Message"
        className="h-11 min-w-0 flex-1 rounded-full border border-surface-border bg-surface-card px-4 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-ocean-300 dark:bg-surface"
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label="Envoyer"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-ocean-500 to-mint-500 text-white transition-opacity disabled:opacity-40 dark:from-ocean-700 dark:to-mint-700"
      >
        <Icon name="ArrowUp" size={18} strokeWidth={2.2} />
      </button>
    </form>
  )
}
