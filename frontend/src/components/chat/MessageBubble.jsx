import FoxyAvatar from '../mascot/FoxyAvatar'
import { formatTime } from '../../utils/format'

/** message : { id, role: 'assistant'|'user', text, date, mood?, source? } — source 'regles' = réponse de secours (IA indisponible). */
export default function MessageBubble({ message }) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className={`flex items-end gap-2 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {isAssistant && (
        <div className="mb-5">
          <FoxyAvatar mood={message.mood ?? 'neutral'} />
        </div>
      )}
      <div className={`flex max-w-[78%] flex-col gap-1 ${isAssistant ? 'items-start' : 'items-end'}`}>
        {isAssistant ? (
          <div className="rounded-2xl rounded-bl-sm border border-surface-border bg-surface-card px-3.5 py-2 text-sm leading-[1.38] text-text-primary">
            {message.text}
          </div>
        ) : (
          <div className="rounded-2xl rounded-br-sm bg-linear-to-br from-ocean-500 to-mint-500 px-3.5 py-2 text-sm leading-[1.38] text-white">
            {message.text}
          </div>
        )}
        <span className="px-1 text-[11px] text-text-muted">
          {formatTime(message.date)}
          {isAssistant && message.source === 'regles' && ' · réponse de secours (IA indisponible)'}
        </span>
      </div>
    </div>
  )
}
