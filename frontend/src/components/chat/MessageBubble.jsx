import Icon from '../ui/Icon'
import { formatTime } from '../../utils/format'

export default function MessageBubble({ message }) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className={`flex items-end gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {isAssistant && (
        <span className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-brand text-white">
          <Icon name="Feather" size={13} />
        </span>
      )}
      <div className={`flex max-w-[80%] flex-col gap-1 sm:max-w-[65%] ${isAssistant ? 'items-start' : 'items-end'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isAssistant
              ? 'rounded-bl-sm border border-surface-border bg-surface-card text-text-primary'
              : 'rounded-br-sm gradient-brand text-white'
          }`}
        >
          {message.text}
        </div>
        <span className="px-1 text-[11px] text-text-muted">{formatTime(message.date)}</span>
      </div>
    </div>
  )
}
