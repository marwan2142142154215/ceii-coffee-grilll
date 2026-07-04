'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SessionData {
  username: string
  token: string
  expires: number
}

interface AuthContextType {
  isLoggedIn: boolean
  username: string | null
  authReady: boolean
  login: (username: string, password: string) => Promise<{ error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  username: null,
  authReady: false,
  login: async () => ({}),
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('admin_session')
    if (stored) {
      try {
        const session: SessionData = JSON.parse(stored)
        if (session.expires > Date.now()) {
          setIsLoggedIn(true)
          setUsername(session.username)
          setToken(session.token)
        } else {
          localStorage.removeItem('admin_session')
        }
      } catch {
        localStorage.removeItem('admin_session')
      }
    }
    setAuthReady(true)
  }, [])

  async function login(username: string, password: string) {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      return { error: data.error || 'Username atau password salah' }
    }

    const session: SessionData = {
      username: data.username,
      token: data.token,
      expires: data.expires,
    }
    localStorage.setItem('admin_session', JSON.stringify(session))
    setIsLoggedIn(true)
    setUsername(data.username)
    setToken(data.token)
    return {}
  }

  function logout() {
    localStorage.removeItem('admin_session')
    setIsLoggedIn(false)
    setUsername(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, authReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
