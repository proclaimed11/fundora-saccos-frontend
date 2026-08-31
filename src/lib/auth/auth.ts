export type StoredUser = {
  userId: number
  username: string
  role: string
}

const TOKEN_KEY = "fundora_token"
const USER_KEY = "fundora_user"

export const saveSession = (token: string, user: StoredUser) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const getStoredUser = (): StoredUser | null => {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredUser
  } catch {
    return null
  }
}

export const isAuthenticated = (): boolean => {
  return !!getToken()
}