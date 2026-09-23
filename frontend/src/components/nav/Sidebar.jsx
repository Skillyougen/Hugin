import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import Icon from '../ui/Icon'
import { NAV_ITEMS } from '../../nav'

/** Sidebar repliable — desktop/tablette large uniquement (≥ 768px). */
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`hidden shrink-0 flex-col gap-6 border-r border-surface-border bg-surface-card p-4 transition-[width] duration-200 md:flex ${
        collapsed ? 'md:w-20' : 'md:w-64'
      }`}
    >
      <div className={`flex items-center gap-2 px-1 ${collapsed ? 'justify-center' : ''}`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-brand text-white">
          <Icon name="Feather" size={18} />
        </span>
        {!collapsed && <span className="text-lg font-semibold tracking-tight text-text-primary">Huginn</span>}
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                collapsed ? 'justify-center' : ''
              } ${isActive ? 'bg-text-primary text-white' : 'text-text-secondary hover:bg-surface-sunken'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={icon} size={18} />
                {!collapsed && <span className="flex-1">{label}</span>}
                {!collapsed && isActive && <Icon name="ChevronRight" size={16} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        aria-label={collapsed ? 'Déplier la navigation' : 'Replier la navigation'}
        className="mt-auto flex items-center justify-center gap-2 rounded-xl border border-surface-border py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-sunken"
      >
        <Icon name={collapsed ? 'PanelLeftOpen' : 'PanelLeftClose'} size={16} />
        {!collapsed && 'Replier'}
      </button>
    </aside>
  )
}
