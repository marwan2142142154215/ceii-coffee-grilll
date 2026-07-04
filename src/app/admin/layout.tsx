'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, authReady } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    if (!authReady) return
    if (pathname === '/admin/login') return
    if (!isLoggedIn) {
      window.location.href = '/admin/login'
    }
  }, [isLoggedIn, authReady, pathname])

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (!authReady || !isLoggedIn) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#0D0D0D', color: '#D4A73C',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔥</div>
          <p>Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .admin-content { color: #1A1A1A; }
        .admin-content input, .admin-content select, .admin-content textarea {
          color: #1A1A1A; background: #fff;
        }
        .admin-content select option { color: #1A1A1A; background: #fff; }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AdminSidebar />
        <div className="admin-content" style={{ flex: 1, background: '#f5f5f0', overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </>
  )
}
