import { useEffect, useState } from 'react'
import HistoryFilter from '../components/history/HistoryFilter'
import HistoryItem from '../components/history/HistoryItem'
import Card from '../components/ui/Card'
import Foxy from '../components/mascot/Foxy'
import { useAuth } from '../context/AuthContext'
import * as api from '../api/client'
import { adaptRecommandation } from '../api/adapters'

export default function HistoryPage() {
  const { token } = useAuth()
  const [filter, setFilter] = useState('all')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    api
      .getRecommandations(token, filter)
      .then((recos) => setEntries(recos.map(adaptRecommandation)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token, filter])

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-2xl flex-col gap-3.5 p-4">
        {/* L'historique comme trace de ce qui a été suivi, pas comme liste d'alertes. */}
        <Card className="flex items-center gap-2.5 py-2.5">
          <Foxy mood="proud" size={66} decorative />
          <div>
            <div className="text-sm font-semibold text-text-primary">{entries.length} recommandations suivies</div>
            <div className="text-xs text-text-muted">Sur les derniers jours de mission</div>
          </div>
        </Card>
        <HistoryFilter value={filter} onChange={setFilter} />
        {loading ? (
          <p className="py-8 text-center text-sm text-text-muted">Chargement…</p>
        ) : error ? (
          <p className="py-8 text-center text-sm font-medium text-status-critical">Erreur : {error}</p>
        ) : entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">Aucune recommandation pour ce filtre.</p>
        ) : (
          entries.map((entry) => <HistoryItem key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  )
}
