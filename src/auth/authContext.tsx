import { createContext, useContext, useState, type ReactNode } from 'react'
import { findDummyUser, type DummyUser } from './dummyUsers'

type AuthContextValue = {
  isAuthenticated: boolean
  /** the signed-in user, null when signed out */
  user: DummyUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const TOKEN_KEY = 'pt_token'
const USER_KEY = 'pt_user'

function loadUser(): DummyUser | null {
  const email = localStorage.getItem(USER_KEY)
  return email ? (findDummyUser(email) ?? null) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<DummyUser | null>(loadUser)

  const login = async (email: string, password: string) => {
    if (!email.trim() || !password) throw new Error('Enter your email and password')

    // TEMP: any password works, the email decides the user. Replace with POST /api/auth/login later.
    const found = findDummyUser(email)
    if (!found) throw new Error('Invalid email or password')

    localStorage.setItem(TOKEN_KEY, 'dummy-token')
    localStorage.setItem(USER_KEY, found.email)
    setToken('dummy-token')
    setUser(found)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  // an old session without a known user (from before this change) counts as signed out
  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token && !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}