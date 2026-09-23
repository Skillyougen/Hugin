import { Link } from 'react-router-dom'
import Foxy from '../mascot/Foxy'
import { useAuth } from '../../context/AuthContext'

/** Accueil sans donnée (§4) : pas d'état vert par défaut, on invite au premier import. */
export default function WelcomeHero({ night }) {
  const { colon } = useAuth()
  return (
    <div className="flex flex-col items-center px-5 py-8 text-center">
      <Foxy mood={night ? 'sleepy' : 'neutral'} size={180} />
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
        {night ? `Bonne nuit, ${colon.nom}` : `Bonjour ${colon.nom}`}
      </h1>
      <p className="mt-1 max-w-sm text-base text-text-secondary">
        Aucune donnée pour l'instant. Importe ta première mesure pour voir ton état global et tes recommandations.
      </p>
      <Link
        to="/donnees"
        // Couleur en inline : la règle globale `a { color }` (index.css, hors couche
        // Tailwind) l'emporterait sur `text-white` et rendrait le texte invisible.
        style={{ color: '#fff' }}
        className="mt-5 rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-semibold no-underline hover:bg-ocean-800"
      >
        Importer mes constantes
      </Link>
    </div>
  )
}
