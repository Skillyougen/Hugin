import Foxy from './Foxy'

/** Pastille ronde avec la tête de Foxy — avatars des bulles, logo. */
export default function FoxyAvatar({ mood = 'neutral', size = 30, square = false }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden border bg-tile ${square ? 'rounded-[9px]' : 'rounded-full'}`}
      style={{ width: size, height: size, borderColor: 'var(--hg-tile-border)' }}
    >
      <Foxy mood={mood} size={size} crop="head" decorative />
    </span>
  )
}
