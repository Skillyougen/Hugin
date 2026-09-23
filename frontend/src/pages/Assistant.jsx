import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import HomeBackground from '../components/home/HomeBackground'
import MessageBubble from '../components/chat/MessageBubble'
import TypingIndicator from '../components/chat/TypingIndicator'
import ChatInput from '../components/chat/ChatInput'
import ChatHero from '../components/chat/WelcomeHero'
import Foxy from '../components/mascot/Foxy'
import { useFoxyMood, moodFromMessage } from '../components/mascot/useFoxyMood'
import { useAuth } from '../context/AuthContext'
import { useNightShift } from '../utils/nightShift'
import * as api from '../api/client'
import { wellbeingFromCouleur, messageFromApi } from '../api/adapters'

const MOOD_LABEL = {
  listening: 'Foxy t’écoute',
  thinking: 'Foxy réfléchit…',
  worried: 'Foxy est attentif',
  alert: 'Foxy veille sur toi',
  sad: 'Foxy est là pour toi',
  sleepy: 'Foxy veille en silence',
  happy: 'Foxy est content',
  proud: 'Foxy est fier de toi',
  cheer: 'Foxy t’encourage',
  surprised: 'Foxy est surpris',
  neutral: 'Foxy est là',
}

/**
 * Assistant : conversation libre avec Huginn, reliée à l'IA locale via
 * POST /chat (contexte : dernières constantes, alerte en cours, échanges
 * précédents de CE colon). L'historique est conservé côté serveur et se
 * relit dans la page Historique. La conversation ne change jamais l'état ni
 * le protocole : garde-fou du cahier des charges (pas de diagnostic, pas de
 * médicament inventé par l'IA).
 */
export default function AssistantPage() {
  const { token } = useAuth()
  const night = useNightShift()
  const [messages, setMessages] = useState([])
  const [etat, setEtat] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [userTyping, setUserTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const listRef = useRef(null)

  useEffect(() => {
    Promise.all([api.getChat(token, 100), api.getEtat(token)])
      .then(([chat, etatRes]) => {
        setMessages(chat.map(messageFromApi))
        setEtat(etatRes)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const wellbeing = useMemo(() => (etat ? wellbeingFromCouleur(etat.couleur) : null), [etat])
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.text
  const mood = useFoxyMood({
    score: wellbeing?.score ?? 100,
    status: wellbeing?.level ?? 'good',
    phase: isTyping ? 'assistantThinking' : userTyping ? 'userTyping' : 'idle',
    lastUserMessage: lastUser,
    hour: new Date().getHours(),
  })

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = useCallback(
    async (text) => {
      const temp = { id: `tmp-${Date.now()}`, role: 'user', text, date: new Date().toISOString() }
      setMessages((prev) => [...prev, temp])
      setIsTyping(true)
      try {
        const res = await api.postChat(token, text)
        const reply = messageFromApi(res.assistant)
        reply.mood = wellbeing?.level === 'critical' ? 'alert' : (moodFromMessage(text) ?? 'neutral')
        setMessages((prev) => [...prev.filter((m) => m.id !== temp.id), messageFromApi(res.utilisateur), reply])
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { id: `err-${Date.now()}`, role: 'assistant', text: `Je n'ai pas pu répondre (${err.message}). Réessaie dans un instant.`, date: new Date().toISOString(), mood: 'sad' },
        ])
      } finally {
        setIsTyping(false)
      }
    },
    [token, wellbeing],
  )

  const started = messages.length > 0

  return (
    <div className="relative flex h-full flex-col">
      <HomeBackground />

      <div className="relative mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col">
        {etat?.protocole_actif && !etat.protocole_actif.termine && (
          <Link
            to="/"
            className="mx-4 mt-3 rounded-2xl bg-status-critical-soft px-4 py-2.5 text-sm font-medium no-underline"
            style={{ color: '#b91c1c' }}
          >
            Une alerte est en cours : suis d'abord le protocole guidé sur l'accueil.
          </Link>
        )}

        {started && (
          <div className="flex items-center gap-2.5 border-b border-surface-border bg-surface-card/70 px-4 py-1.5 backdrop-blur" aria-live="polite">
            <Foxy mood={mood} size={54} decorative />
            <span className="text-[13px] font-semibold text-text-primary">{MOOD_LABEL[mood]}</span>
          </div>
        )}

        {loading ? (
          <p className="p-6 text-center text-sm text-text-muted">Chargement…</p>
        ) : started ? (
          <div ref={listRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3.5">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
        ) : (
          <ChatHero wellbeing={wellbeing} onPick={handleSend} night={night} />
        )}
      </div>

      <div className="relative border-t border-surface-border bg-surface-card px-4 pb-4 pt-3">
        <div className="mx-auto max-w-2xl">
          <ChatInput onSend={handleSend} onTypingChange={setUserTyping} disabled={isTyping || loading} night={night} />
          <p className="m-0 mt-2 text-center text-[11px] text-text-muted">
            Huginn est un assistant de bien-être : il ne pose pas de diagnostic et ne prescrit aucun médicament.
          </p>
        </div>
      </div>
    </div>
  )
}
