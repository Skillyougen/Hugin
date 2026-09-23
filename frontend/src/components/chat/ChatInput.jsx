import { useState } from 'react'
import Icon from '../ui/Icon'

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Écris un message à Huginn…"
        disabled={disabled}
        className="h-11 flex-1 rounded-full border border-surface-border bg-surface-card px-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ocean-300"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Envoyer"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full gradient-brand text-white transition-opacity disabled:opacity-40"
      >
        <Icon name="ArrowUp" size={18} />
      </button>
    </form>
  )
}
