import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MessageBubble from '../chat/MessageBubble'
import Card from '../ui/Card'
import { useAuth } from '../../context/AuthContext'
import * as api from '../../api/client'
import { messageFromApi } from '../../api/adapters'

const jour = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

/** Historique des conversations avec l'assistant, regroupé par jour (lecture seule). */
export default function ConversationHistory() {
  const { token } = useAuth()
  const [messages, setMessages] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api
      .getChat(token, 500)
      .then((res) => setMessages(res.map(messageFromApi)))
      .catch((err) => setError(err.message))
  }, [token])

  if (error) return <p className="py-8 text-center text-sm font-medium text-status-critical">Erreur : {error}</p>
  if (!messages) return <p className="py-8 text-center text-sm text-text-muted">Chargement…</p>
  if (messages.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="m-0 text-sm text-text-secondary">Aucune conversation pour l'instant.</p>
        <Link to="/" className="text-sm font-medium">Parler à Huginn</Link>
      </Card>
    )
  }

  // Regroupement par jour, du plus récent au plus ancien ; messages dans l'ordre de la conversation.
  const groupes = []
  for (const m of messages) {
    const label = jour.format(new Date(m.date))
    const dernier = groupes.at(-1)
    if (dernier && dernier.label === label) dernier.messages.push(m)
    else groupes.push({ label, messages: [m] })
  }
  groupes.reverse()

  return (
    <div className="flex flex-col gap-5">
      {groupes.map((g) => (
        <section key={g.label} className="flex flex-col gap-3">
          <h2 className="m-0 text-xs font-semibold uppercase tracking-wide text-text-muted">{g.label}</h2>
          {g.messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
        </section>
      ))}
      <Link to="/" className="self-center text-sm font-medium">Reprendre la discussion</Link>
    </div>
  )
}
