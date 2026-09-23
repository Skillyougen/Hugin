import { NavLink, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon'
import { NAV_ITEMS } from '../../nav'

/**
 * Nav du haut — mobile/tablette étroite uniquement (< 768px).
 *
 * Pas de bottom bar sur ce format : le logo ramène à l'accueil (chat) et
 * deux boutons icône donnent accès aux deux autres pages depuis n'importe
 * où (toujours 2 boutons, contextuels à la page courante).
 */
export default function MobileTopNav() {
  const { pathname } = useLocation()
  const others = NAV_ITEMS.filter(
    (item) => !(item.end ? pathname === item.to : pathname.startsWith(item.to)),
  )

  return (
    <header
      className="flex items-center justify-between gap-2 border-b border-surface-border bg-surface-card/90 px-4 backdrop-blur md:hidden"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))', paddingBottom: '0.75rem' }}
    >
      <NavLink to="/" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand text-white">
          <Icon name="Feather" size={16} />
        </span>
        <span className="text-sm font-semibold text-text-primary">Huginn</span>
      </NavLink>

      <div className="flex items-center gap-2">
        {others.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            title={label}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-border text-text-secondary transition-colors hover:bg-surface-sunken"
          >
            <Icon name={icon} size={17} />
          </NavLink>
        ))}
      </div>
    </header>
  )
}
