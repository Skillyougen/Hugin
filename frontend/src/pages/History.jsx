import { useMemo, useState } from 'react'
import HistoryFilter from '../components/history/HistoryFilter'
import HistoryList from '../components/history/HistoryList'
import { HISTORY } from '../mocks/history'

export default function History() {
  const [filter, setFilter] = useState('all')

  const entries = useMemo(
    () => (filter === 'all' ? HISTORY : HISTORY.filter((entry) => entry.category === filter)),
    [filter],
  )

  return (
    <div className="h-full overflow-y-auto px-4 py-4 md:px-8 md:py-6">
      <div className="flex flex-col gap-4 pb-4">
        <HistoryFilter value={filter} onChange={setFilter} />
        <HistoryList entries={entries} />
      </div>
    </div>
  )
}
