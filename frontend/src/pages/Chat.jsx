import { useEffect, useRef, useState } from 'react'
import MessageBubble from '../components/chat/MessageBubble'
import TypingIndicator from '../components/chat/TypingIndicator'
import ChatInput from '../components/chat/ChatInput'
import { generateReply, WELCOME_MESSAGE } from '../mocks/chatAssistant'

let messageId = 0
const nextId = () => `msg-${messageId++}`

/**
 * Page d'accueil = chat avec Huginn (façon Claude/ChatGPT).
 *
 * ⚠️ Ce chat va au-delà du périmètre initial du cahier des charges (qui
 * classait "chat avec l'assistant IA" en V1 / hors prototype) — décision
 * produit assumée pour cette itération. Les réponses viennent d'un mock
 * front-only (voir mocks/chatAssistant.js) tant que le backend/Ollama ne
 * sont pas branchés ; le garde-fou "jamais de diagnostic, jamais de
 * médicament" s'applique quand même, y compris ici.
 */
export default function Chat() {
  const [messages, setMessages] = useState(() => [
    { id: nextId(), role: 'assistant', text: WELCOME_MESSAGE, date: new Date() },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isTyping])

  function handleSend(text) {
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text, date: new Date() }])
    setIsTyping(true)

    // Simule le temps de réponse du modèle. À remplacer par l'appel API
    // réel (avec repli sur le moteur de règles si Ollama est indisponible).
    window.setTimeout(() => {
      const reply = generateReply(text)
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', text: reply, date: new Date() }])
      setIsTyping(false)
    }, 700 + Math.random() * 500)
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="chat-bg" aria-hidden="true" />

      <div className="relative flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={scrollRef} />
        </div>
      </div>

      <div
        className="relative border-t border-surface-border/70 bg-surface-card/80 px-4 py-3 backdrop-blur md:px-8"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="mx-auto max-w-2xl">
          <ChatInput onSend={handleSend} disabled={isTyping} />
        </div>
      </div>
    </div>
  )
}
