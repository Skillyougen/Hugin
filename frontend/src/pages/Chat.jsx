import { useEffect, useMemo, useRef, useState } from 'react'
import ChatBackground from '../components/chat/ChatBackground'
import MessageBubble from '../components/chat/MessageBubble'
import TypingIndicator from '../components/chat/TypingIndicator'
import ChatInput from '../components/chat/ChatInput'
import WelcomeHero from '../components/chat/WelcomeHero'
import Foxy from '../components/mascot/Foxy'
import { useFoxyMood, moodFromMessage } from '../components/mascot/useFoxyMood'
import { useScenario } from '../context/ScenarioContext'
import { computeWellbeing } from '../utils/wellbeing'
import { useNightShift } from '../utils/nightShift'
import { generateReply } from '../mocks/chatAssistant'

let messageId = 0
const nextId = () => `msg-${messageId++}`

const MOOD_LABEL = {
  listening: 'Foxy t’écoute',
  thinking: 'Foxy réfléchit…',
  worried: 'Foxy est attentif',
  alert: 'Foxy te conseille le médecin de bord',
  sad: 'Foxy est là pour toi',
  sleepy: 'Foxy veille en silence',
  happy: 'Foxy est content',
  proud: 'Foxy est fier de toi',
  cheer: 'Foxy t’encourage',
  surprised: 'Foxy est surpris',
  neutral: 'Foxy est là',
}

/**
 * Accueil = chat avec Huginn.
 *
 * Sans message du colon, on montre un vrai écran d'accueil (WelcomeHero).
 * Dès le premier message, Foxy passe dans un bandeau compact au-dessus du
 * fil et réagit : à l'écoute pendant la saisie, réfléchit pendant la
 * réponse, puis prend l'humeur du message (voir useFoxyMood).
 *
 * Garde-fou : jamais de diagnostic, jamais de médicament.
 */
export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [userTyping, setUserTyping] = useState(false)
  const endRef = useRef(null)
  const listRef = useRef(null)
  const night = useNightShift()

  const { scenario } = useScenario()
  const wellbeing = useMemo(() => computeWellbeing(scenario.vitals), [scenario])
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.text

  const mood = useFoxyMood({
    score: wellbeing.score,
    status: wellbeing.level,
    phase: isTyping ? 'assistantThinking' : userTyping ? 'userTyping' : 'idle',
    lastUserMessage: lastUser,
    hour: new Date().getHours(),
  })

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  function handleSend(text) {
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text, date: new Date() }])
    setIsTyping(true)
    // Simule le temps de réponse du modèle. À remplacer par l'appel API réel.
    setTimeout(() => {
      const reply = generateReply(text)
      const replyMood = wellbeing.level === 'critical' ? 'alert' : moodFromMessage(text) ?? 'neutral'
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', text: reply, date: new Date(), mood: replyMood }])
      setIsTyping(false)
    }, 700 + Math.random() * 500)
  }

  const started = messages.length > 0

  return (
    <div className="relative flex h-full flex-col">
      <ChatBackground />

      <div className="relative mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col">
        {started && (
          <div className="flex items-center gap-2.5 border-b border-surface-border bg-surface-card/70 px-4 py-1.5 backdrop-blur" aria-live="polite">
            <Foxy mood={mood} size={54} decorative />
            <span className="text-[13px] font-semibold text-text-primary">{MOOD_LABEL[mood]}</span>
          </div>
        )}

        {started ? (
          <div ref={listRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3.5">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={endRef} />
          </div>
        ) : (
          <WelcomeHero wellbeing={wellbeing} onPick={handleSend} night={night} />
        )}
      </div>

      <div className="relative border-t border-surface-border bg-surface-card px-4 pb-4 pt-3">
        <div className="mx-auto max-w-2xl">
          <ChatInput onSend={handleSend} onTypingChange={setUserTyping} disabled={isTyping} night={night} />
        </div>
      </div>
    </div>
  )
}
