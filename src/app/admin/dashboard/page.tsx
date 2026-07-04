'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Package, ShoppingBag, Tags, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, ordersToday: 0, promoActive: false })

  useEffect(() => {
    async function load() {
      const [prod, cat, orders, promo] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_promo', true).gt('promo_price', 0),
      ])
      setStats({
        products: prod.count || 0,
        categories: cat.count || 0,
        ordersToday: orders.count || 0,
        promoActive: (promo.count || 0) > 0,
      })
    }
    load()

    const sub = supabase.channel('admin-dashboard').on('postgres_changes', {
      event: '*', schema: 'public', table: 'orders',
    }, () => load()).subscribe()

    return () => { sub.unsubscribe() }
  }, [])

  const cards = [
    { label: 'Produk', value: stats.products, icon: Package, color: '#D4A73C' },
    { label: 'Kategori', value: stats.categories, icon: Tags, color: '#4A7C59' },
    { label: 'Pesanan Hari Ini', value: stats.ordersToday, icon: ShoppingBag, color: '#2980b9' },
    { label: 'Promo Aktif', value: stats.promoActive ? 'Ya' : 'Tidak', icon: TrendingUp, color: '#e74c3c' },
  ]

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 20 }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {cards.map(card => (
          <div key={card.label} style={{
            background: '#fff', borderRadius: 14, padding: '20px',
            border: '1px solid #e0ddd5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={20} color={card.color} />
              </div>
            </div>
            <p style={{ fontSize: 11, color: '#888', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>{card.label}</p>
            <p style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', margin: 0 }}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
