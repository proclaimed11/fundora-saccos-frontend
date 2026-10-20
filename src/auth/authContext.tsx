import { createContext, useContext, useState, type ReactNode } from 'react'

type AuthContextValue = {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const TOKEN_KEY = 'pt_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))

  const login = async (email: string, password: string) => {
    // TEMP: accepts anything non-empty. Replace with your real API call later.
    if (!email.trim() || !password) throw new Error('Enter your email and password')
    localStorage.setItem(TOKEN_KEY, 'dummy-token')
    setToken('dummy-token')
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}