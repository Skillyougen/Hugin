import { useLocation } from 'react-router-dom'
import Icon from '../ui/Icon'
import { colon } from '../../mocks/colon'
import { NAV_ITEMS } from '../../nav'

/** En-tête desktop/tablette large — titre de page + colon connecté. */
export default function TopBar() {
  const { pathname } = useLocation()
  const current = NAV_ITEMS.find((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)))

  return (
    <header className="hidden md:flex md:items-center md:justify-between md:border-b md:border-surface-border md:bg-surface-card md:px-8 md:py-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Vaisseau {colon.ship}</p>
        <h1 className="text-xl font-semibold text-text-primary">{current?.label ?? 'Huginn'}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-border text-text-secondary transition-colors hover:bg-surface-sunken"
        >
          <Icon name="Bell" size={18} />
        </button>
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full gradient-brand text-sm font-semibold text-white">
            {colon.avatarInitials}
          </span>
          <div className="leading-tight">
            <p className="text-sm font-medium text-text-primary">{colon.firstName}</p>
            <p className="text-xs text-text-muted">{colon.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
