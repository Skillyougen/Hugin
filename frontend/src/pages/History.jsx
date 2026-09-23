import { useMemo, useState } from 'react'
import HistoryFilter from '../components/history/HistoryFilter'
import HistoryItem from '../components/history/HistoryItem'
import Card from '../components/ui/Card'
import Foxy from '../components/mascot/Foxy'
import { HISTORY } from '../mocks/history'

export default function HistoryPage() {
  const [filter, setFilter] = useState('all')
  const entries = useMemo(() => (filter === 'all' ? HISTORY : HISTORY.filter((e) => e.category === filter)), [filter])

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-2xl flex-col gap-3.5 p-4">
        {/* L'historique comme trace de ce qui a été suivi, pas comme liste d'alertes. */}
        <Card className="flex items-center gap-2.5 py-2.5">
          <Foxy mood="proud" size={66} decorative />
          <div>
            <div className="text-sm font-semibold text-text-primary">{HISTORY.length} recommandations suivies</div>
            <div className="text-xs text-text-muted">Sur les derniers jours de mission</div>
          </div>
        </Card>
        <HistoryFilter value={filter} onChange={setFilter} />
        {entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">Aucune recommandation pour ce filtre.</p>
        ) : (
          entries.map((entry) => <HistoryItem key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  )
}
