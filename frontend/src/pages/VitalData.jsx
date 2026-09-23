import { useCallback, useEffect, useState } from 'react'
import WellbeingCard from '../components/status/WellbeingCard'
import RecommendationCard from '../components/status/RecommendationCard'
import ActiveProtocolCard from '../components/status/ActiveProtocolCard'
import VitalMiniCard from '../components/vitals/VitalMiniCard'
import VitalsChart from '../components/vitals/VitalsChart'
import ThresholdLegend from '../components/vitals/ThresholdLegend'
import MeasureImportForm from '../components/vitals/MeasureImportForm'
import Card from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import * as api from '../api/client'
import { wellbeingFromCouleur, vitalsFromMesure, chartPointsFromMesures, adaptRecommandation } from '../api/adapters'
import { formatTime } from '../utils/format'

export default function VitalDataPage() {
  const { token, colon } = useAuth()
  const [etat, setEtat] = useState(null)
  const [mesures, setMesures] = useState([])
  const [recommandations, setRecommandations] = useState([])
  const [range, setRange] = useState('24h')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(
    async (r = range) => {
      const [etatRes, mesuresRes, recosRes] = await Promise.all([
        api.getEtat(token),
        api.getMesures(token, r),
        api.getRecommandations(token),
      ])
      setEtat(etatRes)
      setMesures(mesuresRes)
      setRecommandations(recosRes)
    },
    [token, range],
  )

  useEffect(() => {
    setLoading(true)
    refresh('24h')
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
    // Chargement initial uniquement : les changements de `range` sont gérés par handleRangeChange.
  }, [])

  async function handleRangeChange(newRange) {
    setRange(newRange)
    try {
      setMesures(await api.getMesures(token, newRange))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleImport(mesure) {
    await api.postMesure(token, mesure)
    await refresh(range)
  }

  async function handleEtapeSuivante() {
    const protocole = await api.avancerProtocole(token)
    setEtat((prev) => ({ ...prev, protocole_actif: protocole }))
  }

  if (loading) {
    return <div className="p-4 text-sm text-text-muted">Chargement…</div>
  }

  if (error) {
    return <div className="p-4 text-sm font-medium text-status-critical">Erreur : {error}</div>
  }

  const wellbeing = wellbeingFromCouleur(etat.couleur)
  const vitals = vitalsFromMesure(etat.derniere_mesure)
  const chartData = chartPointsFromMesures(mesures, range)

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-2xl flex-col gap-5 p-4">
        {!wellbeing ? (
          <Card className="flex flex-col gap-2">
            <h2 className="m-0 text-sm font-semibold text-text-primary">Aucune donnée pour l'instant</h2>
            <p className="m-0 text-sm text-text-secondary">
              Importe ta première mesure ci-dessous pour voir apparaître ton état global, {colon?.nom}.
            </p>
          </Card>
        ) : (
          <>
            <WellbeingCard wellbeing={wellbeing} name={colon?.nom} />

            {etat.protocole_actif && (
              <ActiveProtocolCard protocole={etat.protocole_actif} onEtapeSuivante={handleEtapeSuivante} />
            )}

            {vitals && (
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="m-0 text-sm font-semibold text-text-primary">Valeurs en temps réel</h2>
                  <span className="text-xs text-text-muted">
                    Mise à jour {formatTime(etat.derniere_mesure.timestamp)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {Object.keys(vitals).map((vitalKey) => (
                    <VitalMiniCard key={vitalKey} vitalKey={vitalKey} value={vitals[vitalKey]} />
                  ))}
                </div>
                <ThresholdLegend />
              </section>
            )}

            <section className="flex flex-col gap-3">
              <h2 className="m-0 text-sm font-semibold text-text-primary">Évolution</h2>
              <VitalsChart data={chartData} range={range} onRangeChange={handleRangeChange} />
            </section>

            {recommandations.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="m-0 text-sm font-semibold text-text-primary">Recommandations</h2>
                {recommandations.slice(0, 5).map((r) => (
                  <RecommendationCard key={r.id} recommendation={adaptRecommandation(r)} />
                ))}
              </section>
            )}
          </>
        )}

        <MeasureImportForm onSubmit={handleImport} />
      </div>
    </div>
  )
}
