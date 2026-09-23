import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import HomeBackground from '../components/home/HomeBackground'
import WelcomeHero from '../components/home/WelcomeHero'
import WellbeingCard from '../components/status/WellbeingCard'
import ActiveProtocolCard from '../components/status/ActiveProtocolCard'
import RecommendationsGrid from '../components/status/RecommendationsGrid'
import VitalMiniCard from '../components/vitals/VitalMiniCard'
import { useAuth } from '../context/AuthContext'
import { useNightShift } from '../utils/nightShift'
import { formatTime } from '../utils/format'
import * as api from '../api/client'
import { wellbeingFromCouleur, vitalsFromMesure, adaptRecommandation } from '../api/adapters'

const POLL_MS = 10000

/**
 * Accueil (cahier des charges §4, page 1) : état global, résumé des
 * dernières constantes, recommandations, protocole guidé en cas de risque.
 * Tout vient de GET /etat ; le bandeau des alertes équipage est dans
 * <CrewAlerts /> (App.jsx).
 */
export default function HomePage() {
  const { token, colon } = useAuth()
  const night = useNightShift()
  const [etat, setEtat] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(() => api.getEtat(token).then((e) => { setEtat(e); setError(null) }), [token])

  useEffect(() => {
    load().catch((err) => setError(err.message))
    const id = setInterval(() => load().catch(() => {}), POLL_MS)
    return () => clearInterval(id)
  }, [load])

  async function handleEtapeSuivante() {
    const protocole = await api.avancerProtocole(token)
    setEtat((prev) => ({ ...prev, protocole_actif: protocole }))
  }

  if (error && !etat) return <div className="p-4 text-sm font-medium text-status-critical">Erreur : {error}</div>
  if (!etat) return <div className="p-4 text-sm text-text-muted">Chargement…</div>

  const wellbeing = wellbeingFromCouleur(etat.couleur)
  const vitals = vitalsFromMesure(etat.derniere_mesure)

  return (
    <div className="relative h-full overflow-y-auto">
      <HomeBackground />
      <div className="relative mx-auto flex max-w-2xl flex-col gap-5 p-4">
        {!wellbeing ? (
          <WelcomeHero night={night} />
        ) : (
          <>
            <WellbeingCard wellbeing={wellbeing} name={colon.nom} />

            {etat.protocole_actif && (
              <ActiveProtocolCard protocole={etat.protocole_actif} onEtapeSuivante={handleEtapeSuivante} />
            )}

            {vitals && (
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="m-0 text-sm font-semibold text-text-primary">Dernières constantes</h2>
                  <span className="text-xs text-text-muted">Importées à {formatTime(etat.derniere_mesure.timestamp)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {Object.keys(vitals).map((key) => (
                    <VitalMiniCard key={key} vitalKey={key} value={vitals[key]} />
                  ))}
                </div>
              </section>
            )}

            {etat.recommandations.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="m-0 text-sm font-semibold text-text-primary">Recommandations</h2>
                <RecommendationsGrid recommendations={etat.recommandations.map(adaptRecommandation)} />
              </section>
            )}

            <Link to="/donnees" className="self-center text-sm font-medium text-ocean-600">
              Importer de nouvelles constantes
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
