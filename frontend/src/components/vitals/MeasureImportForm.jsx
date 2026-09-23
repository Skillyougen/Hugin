import { useState } from 'react'
import Card from '../ui/Card'

const FIELDS = [
  { key: 'frequence_cardiaque', label: 'Fréquence cardiaque (bpm)', min: 20, max: 250, step: '1' },
  { key: 'spo2', label: 'SpO₂ (%)', min: 0, max: 100, step: '1' },
  { key: 'temperature', label: 'Température (°C)', min: 30, max: 42, step: '0.1' },
  { key: 'sommeil_heures', label: 'Sommeil (h, nuit précédente)', min: 0, max: 24, step: '0.1' },
]

const EMPTY = { frequence_cardiaque: '', spo2: '', temperature: '', sommeil_heures: '', symptomes: '' }

/** Import manuel d'une mesure (cahier des charges §4, page 2) : `POST /mesures`. */
export default function MeasureImportForm({ onSubmit }) {
  const [values, setValues] = useState(EMPTY)
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)

  function setField(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await onSubmit({
        frequence_cardiaque: Number(values.frequence_cardiaque),
        spo2: Number(values.spo2),
        temperature: Number(values.temperature),
        sommeil_heures: Number(values.sommeil_heures),
        symptomes: values.symptomes.trim() || undefined,
      })
      setValues(EMPTY)
    } catch (err) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="flex flex-col gap-3">
        <h2 className="m-0 text-sm font-semibold text-text-primary">Importer une mesure</h2>
        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map((f) => (
            <div key={f.key} className="flex flex-col gap-1.5">
              <label htmlFor={f.key} className="text-xs text-text-muted">{f.label}</label>
              <input
                id={f.key}
                type="number"
                required
                min={f.min}
                max={f.max}
                step={f.step}
                value={values[f.key]}
                onChange={(e) => setField(f.key, e.target.value)}
                className="rounded-xl border border-surface-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-ocean-500"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="symptomes" className="text-xs text-text-muted">Comment tu te sens (optionnel)</label>
          <textarea
            id="symptomes"
            maxLength={500}
            value={values.symptomes}
            onChange={(e) => setField('symptomes', e.target.value)}
            rows={2}
            className="resize-none rounded-xl border border-surface-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-ocean-500"
          />
        </div>
        {error && <p className="m-0 text-xs font-medium text-status-critical" role="alert">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-full bg-linear-to-br from-ocean-500 to-mint-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? 'Envoi…' : 'Importer'}
        </button>
      </Card>
    </form>
  )
}
