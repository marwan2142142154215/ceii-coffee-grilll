'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const { login, isLoggedIn } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (isLoggedIn) {
    window.location.href = '/admin/dashboard'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.error('Username dan password wajib diisi')
      return
    }

    setLoading(true)
    const result = await login(username.trim(), password)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Berhasil login!')
      window.location.href = '/admin/dashboard'
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0D0D0D 0%, #1A0F0A 50%, #1A0F0A 100%)',
      padding: 20,
    }}>
      <form onSubmit={handleSubmit}
        style={{
          width: '100%', maxWidth: 360,
          background: '#1A1A1A', borderRadius: 16,
          padding: '32px 24px',
          border: '1px solid rgba(212,167,60,0.3)',
          boxShadow: '0 0 30px rgba(212,167,60,0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔥</div>
          <h1 style={{
            fontFamily: 'serif', fontSize: 20, fontWeight: 'bold',
            color: '#D4A73C', margin: 0, letterSpacing: 1,
          }}>
            CEII Admin
          </h1>
          <p style={{ color: '#B8AFA0', fontSize: 12, marginTop: 4 }}>
            Masuk ke panel admin
          </p>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ color: '#B8AFA0', fontSize: 12, display: 'block', marginBottom: 4 }}>
            Username
          </label>
          <div style={{ position: 'relative' }}>
            <User size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Masukkan username"
              autoComplete="username"
              style={{
                width: '100%', padding: '10px 12px 10px 34px',
                borderRadius: 10, border: '1px solid rgba(212,167,60,0.2)',
                background: '#0D0D0D', color: '#F5F0E8',
                fontSize: 14, outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ color: '#B8AFA0', fontSize: 12, display: 'block', marginBottom: 4 }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Masukkan password"
              autoComplete="current-password"
              style={{
                width: '100%', padding: '10px 12px 10px 34px',
                borderRadius: 10, border: '1px solid rgba(212,167,60,0.2)',
                background: '#0D0D0D', color: '#F5F0E8',
                fontSize: 14, outline: 'none',
              }}
            />
          </div>
        </div>

        <button type="submit" disabled={loading}
          style={{
            width: '100%', padding: '11px', borderRadius: 10,
            background: '#D4A73C', color: '#000', border: 'none',
            fontSize: 14, fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>

        <p style={{ color: '#555', fontSize: 10, textAlign: 'center', marginTop: 16, marginBottom: 0 }}>
          Panel admin CEII Coffee & Grill
        </p>
      </form>
    </div>
  )
}
