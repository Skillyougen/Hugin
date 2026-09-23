import { useEffect, useState } from 'react'
import Icon from '../ui/Icon'
import ActiveProtocolCard from './ActiveProtocolCard'
import { useAuth } from '../../context/AuthContext'
import * as api from '../../api/client'

const POLL_MS = 8000

/**
 * Bandeau des alertes actives d'AUTRES colons (cahier des charges §4) : aucune
 * constante, juste le fait qu'il y a urgence. « Que faire ? » affiche le
 * protocole guidé de la personne concernée en lecture seule ; l'alerte se
 * résout côté serveur quand le colon termine son protocole (§5).
 */
export default function CrewAlerts() {
  const { token, colon } = useAuth()
  const [alertes, setAlertes] = useState([])
  const [protocole, setProtocole] = useState(null)
  const [error, setError] = useState(null)
  const ouvertId = protocole?.alerte_id

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await api.getAlertes(token)
        if (!cancelled) setAlertes(res.filter((a) => a.colon_id !== colon.id))
        // Garde la vue « Que faire ? » à jour (progression, résolution).
        if (ouvertId) {
          const p = await api.getAlerteProtocole(token, ouvertId)
          if (!cancelled) setProtocole(p)
        }
      } catch {
        /* réseau indisponible : on garde l'affichage précédent */
      }
    }
    load()
    const id = setInterval(load, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [token, colon.id, ouvertId])

  async function ouvrir(alerteId) {
    setError(null)
    try {
      setProtocole(await api.getAlerteProtocole(token, alerteId))
    } catch (err) {
      setError(err.message)
    }
  }

  if (alertes.length === 0 && !protocole) return null

  return (
    <div className="flex max-h-[60dvh] flex-col gap-2 overflow-y-auto border-b border-surface-border bg-surface px-4 py-2">
      {alertes.map((a) => (
        <div key={a.id} role="alert" className="flex items-center gap-3 rounded-2xl bg-status-critical-soft px-4 py-2.5 text-[#b91c1c]">
          <Icon name="ShieldAlert" size={20} className="shrink-0" />
          <p className="m-0 flex-1 text-sm font-medium">
            {a.colon_nom} : {a.motif}
          </p>
          <button
            type="button"
            onClick={() => ouvrir(a.id)}
            className="shrink-0 rounded-full bg-status-critical px-3 py-1.5 text-xs font-semibold text-white"
          >
            Que faire ?
          </button>
        </div>
      ))}
      {error && <p className="m-0 text-xs font-medium text-status-critical">{error}</p>}
      {protocole && (
        <div className="flex flex-col gap-2">
          <ActiveProtocolCard protocole={protocole} readOnly />
          <button type="button" onClick={() => setProtocole(null)} className="self-start text-xs font-medium text-text-secondary underline">
            Fermer
          </button>
        </div>
      )}
    </div>
  )
}
