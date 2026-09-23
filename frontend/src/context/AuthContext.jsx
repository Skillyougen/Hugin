import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as api from '../api/client'

const AuthContext = createContext(null)
const TOKEN_KEY = 'huginn-token'

/**
 * Session du colon connecté (token + profil), persistée en localStorage pour
 * survivre à un rechargement. Toutes les routes protégées de l'API dépendent
 * de ce token (voir backend/app/auth.py::get_current_colon).
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [colon, setColon] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    api
      .getColonMoi(token)
      .then(setColon)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const login = useCallback(async (identifiant, motDePasse) => {
    const res = await api.login(identifiant, motDePasse)
    localStorage.setItem(TOKEN_KEY, res.token)
    setToken(res.token)
    setColon({ id: res.colon_id, nom: res.nom })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setColon(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, colon, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un <AuthProvider>')
  return ctx
}
