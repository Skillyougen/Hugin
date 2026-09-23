import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MobileTopNav from './MobileTopNav'

/**
 * Ossature de l'app :
 * - Desktop/tablette large (≥ 768px) : sidebar repliable + top bar.
 * - Mobile/tablette étroite (< 768px) : pas de bottom bar — nav du haut à
 *   2 boutons contextuels (voir MobileTopNav).
 *
 * Chaque page gère elle-même son scroll et son padding interne (la page
 * Chat a besoin d'un layout plein écran, contrairement aux pages Données
 * et Historique).
 */
export default function AppLayout() {
  return (
    <div className="flex h-dvh bg-surface">
      <Sidebar />
      <div className="flex min-h-0 flex-1 flex-col">
        <TopBar />
        <MobileTopNav />
        <div className="min-h-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
