import HistoryItem from './HistoryItem'

export default function HistoryList({ entries }) {
  if (entries.length === 0) {
    return <p className="py-8 text-center text-sm text-text-muted">Aucune recommandation pour ce filtre.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => (
        <HistoryItem key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
