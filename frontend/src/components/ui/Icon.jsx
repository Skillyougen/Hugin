import * as icons from 'lucide-react'

/**
 * Résout un nom d'icône (string, tel que stocké dans les mocks/futures
 * réponses API) vers le composant Lucide correspondant. Fallback discret
 * (Circle) si le nom est inconnu, plutôt que de casser le rendu.
 */
export default function Icon({ name, size = 20, strokeWidth = 1.75, className, ...props }) {
  const Component = icons[name] ?? icons.Circle
  return <Component size={size} strokeWidth={strokeWidth} className={className} {...props} />
}
