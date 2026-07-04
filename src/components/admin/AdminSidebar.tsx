'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard, UtensilsCrossed, Tags, MessageCircle, ShoppingBag,
  QrCode, BarChart3, ChefHat, Package, MessageSquare, Sun,
  Heart, Table2, Printer, Eye, LogOut,
} from 'lucide-react'

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/admin/promo', label: 'Promo', icon: Tags },
  { href: '/admin/store-settings', label: 'Pengaturan', icon: MessageCircle },
  { href: '/admin/orders', label: 'Pesanan', icon: ShoppingBag },
  { href: '/admin/order-history', label: 'Riwayat', icon: ShoppingBag },
  { href: '/admin/qrcode', label: 'QR Code', icon: QrCode },
  { href: '/admin/visitor-analytics', label: 'Analitik', icon: BarChart3 },
  { href: '/admin/kitchen-display', label: 'Dapur', icon: ChefHat },
  { href: '/admin/inventory', label: 'Stok', icon: Package },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
  { href: '/admin/shift-summary', label: 'Shift', icon: Sun },
  { href: '/admin/theme-preview', label: 'Tema', icon: Eye },
  { href: '/admin/loyalty', label: 'Pelanggan', icon: Heart },
  { href: '/admin/tables', label: 'Meja', icon: Table2 },
  { href: '/admin/menu-preview', label: 'Preview', icon: Eye },
  { href: '/admin/printer-settings', label: 'Printer', icon: Printer },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { username, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  return (
    <aside style={{
      width: 220, background: '#1A1A1A', color: '#F5F0E8',
      display: 'flex', flexDirection: 'column', height: '100vh',
      position: 'sticky', top: 0,
    }}>
      <div style={{
        padding: '16px 16px 12px',
        borderBottom: '1px solid rgba(212,167,60,0.2)',
      }}>
        <h1 style={{ fontSize: 16, fontWeight: 'bold', fontFamily: 'serif', color: '#D4A73C', margin: 0 }}>
          🔥 CEII Admin
        </h1>
        {username && (
          <p style={{ fontSize: 11, color: '#B8AFA0', margin: '4px 0 0' }}>
            {username}
          </p>
        )}
      </div>

      <nav style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
        {menuItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 16px', fontSize: 13,
                color: isActive ? '#D4A73C' : '#B8AFA0',
                background: isActive ? 'rgba(212,167,60,0.1)' : 'transparent',
                borderRight: isActive ? '3px solid #D4A73C' : '3px solid transparent',
                textDecoration: 'none', transition: 'all 0.2s',
                fontWeight: isActive ? 'bold' : 'normal',
              }}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <button onClick={handleLogout}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
          borderTop: '1px solid rgba(212,167,60,0.2)',
          background: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
          color: '#e74c3c', fontSize: 13, cursor: 'pointer', width: '100%',
        }}>
        <LogOut size={16} />
        Logout
      </button>
    </aside>
  )
}
