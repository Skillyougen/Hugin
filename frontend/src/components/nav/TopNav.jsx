import { Link, NavLink, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon'
import FoxyAvatar from '../mascot/FoxyAvatar'
import { NAV_ITEMS } from '../../nav'
import { useNightShift } from '../../utils/nightShift'
import { useAuth } from '../../context/AuthContext'

/**
 * Nav du haut, seule nav de l'app : le logo (tête de Foxy) ramène à
 * l'accueil, deux boutons icône donnent accès aux deux autres pages.
 */
export default function TopNav() {
  const { pathname } = useLocation()
  const night = useNightShift()
  const { colon, logout } = useAuth()
  const others = NAV_ITEMS.filter((item) => item.href !== pathname)

  return (
    <header className="flex items-center justify-between gap-2 border-b border-surface-border bg-surface-card px-4 py-3">
      <Link to="/" className="flex items-center gap-2 text-text-primary no-underline hover:text-text-primary" aria-label="Accueil">
        <FoxyAvatar mood={night ? 'sleepy' : 'neutral'} size={32} square />
        <span className="text-sm font-semibold">Huginn</span>
      </Link>
      <nav className="flex items-center gap-2">
        {others.map(({ href, label, icon }) => (
          <NavLink
            key={href}
            to={href}
            aria-label={label}
            title={label}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-border text-text-secondary transition-colors hover:bg-surface-sunken hover:text-text-primary"
          >
            <Icon name={icon} size={17} />
          </NavLink>
        ))}
        {colon && (
          <button
            type="button"
            onClick={logout}
            aria-label={`Se déconnecter (${colon.nom})`}
            title={`Se déconnecter (${colon.nom})`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-border text-text-secondary transition-colors hover:bg-surface-sunken hover:text-text-primary"
          >
            <Icon name="LogOut" size={17} />
          </button>
        )}
      </nav>
    </header>
  )
}
