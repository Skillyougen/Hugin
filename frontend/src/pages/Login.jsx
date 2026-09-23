import { useState } from 'react'
import FoxyAvatar from '../components/mascot/FoxyAvatar'
import { useAuth } from '../context/AuthContext'

/**
 * Pas d'auto-inscription (cahier des charges §2) : comptes pré-créés par
 * backend/app/seed.py (erik/erik1234, nyota/nyota1234).
 */
export default function LoginPage() {
  const { login } = useAuth()
  const [identifiant, setIdentifiant] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await login(identifiant, motDePasse)
    } catch {
      setError('Identifiant ou mot de passe incorrect.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col items-center gap-4">
        <FoxyAvatar mood="neutral" size={72} />
        <h1 className="m-0 text-lg font-semibold text-text-primary">Connexion à Huginn</h1>

        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="identifiant" className="text-xs font-medium text-text-muted">Identifiant</label>
          <input
            id="identifiant"
            autoComplete="username"
            value={identifiant}
            onChange={(e) => setIdentifiant(e.target.value)}
            className="rounded-xl border border-surface-border bg-surface-card px-3 py-2 text-sm text-text-primary outline-none focus:border-ocean-500"
            required
          />
        </div>

        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="mot-de-passe" className="text-xs font-medium text-text-muted">Mot de passe</label>
          <input
            id="mot-de-passe"
            type="password"
            autoComplete="current-password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="rounded-xl border border-surface-border bg-surface-card px-3 py-2 text-sm text-text-primary outline-none focus:border-ocean-500"
            required
          />
        </div>

        {error && <p className="m-0 text-xs font-medium text-status-critical" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-linear-to-br from-ocean-500 to-mint-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
