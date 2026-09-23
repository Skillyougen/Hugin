// Client HTTP pour l'API backend (voir docs/contrat-interface.md à la racine).
// Base URL surchageable via VITE_API_URL ; par défaut le backend Docker/local
// écoute sur le port 8000, atteignable depuis le navigateur dans les deux cas
// (Docker publie le port sur l'hôte, il n'y a pas de proxy réseau à gérer).
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// FastAPI renvoie `detail` en string (401, 404…) ou en liste d'erreurs de
// validation Pydantic (422, un objet {loc, msg} par champ en cause).
function formatDetail(detail, status) {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d) => `${d.loc?.at(-1) ?? 'champ'} : ${d.msg}`).join(' — ')
  }
  return `Erreur API (${status})`
}

export class ApiError extends Error {
  constructor(status, detail) {
    super(formatDetail(detail, status))
    this.status = status
  }
}

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new ApiError(res.status, payload?.detail)
  }
  if (res.status === 204) return null
  return res.json()
}

export function login(identifiant, motDePasse) {
  return request('/auth/login', { method: 'POST', body: { identifiant, mot_de_passe: motDePasse } })
}

export function getColonMoi(token) {
  return request('/colons/moi', { token })
}

export function postMesure(token, mesure) {
  return request('/mesures', { method: 'POST', token, body: mesure })
}

export function getMesures(token, range = '24h') {
  return request(`/mesures?range=${encodeURIComponent(range)}`, { token })
}

export function getEtat(token) {
  return request('/etat', { token })
}

export function getRecommandations(token, type) {
  const query = type && type !== 'all' ? `?type=${encodeURIComponent(type)}` : ''
  return request(`/recommandations${query}`, { token })
}

export function getHistoriqueConversation(token) {
  return request('/historique-conversation', { token })
}

export function getAlertes(token) {
  return request('/alertes', { token })
}

export function getAlerteProtocole(token, alerteId) {
  return request(`/alertes/${alerteId}/protocole`, { token })
}

export function avancerProtocole(token) {
  return request('/protocole/etape-suivante', { method: 'POST', token })
}

export function getMedicaments(token) {
  return request('/medicaments', { token })
}

export function getChat(token, limite = 50) {
  return request(`/chat?limite=${encodeURIComponent(limite)}`, { token })
}

export function postChat(token, message) {
  return request('/chat', { method: 'POST', token, body: { message } })
}
