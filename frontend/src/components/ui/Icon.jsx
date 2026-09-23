import * as icons from 'lucide-react'

/**
 * Résout un nom d'icône (string) vers le
 * composant Lucide correspondant. Repli discret (Circle) si le nom est inconnu.
 */
export default function Icon({ name, size = 20, strokeWidth = 1.75, color = 'currentColor', ...props }) {
  const Component = icons[name] ?? icons.Circle
  return <Component size={size} strokeWidth={strokeWidth} color={color} aria-hidden="true" {...props} />
}
