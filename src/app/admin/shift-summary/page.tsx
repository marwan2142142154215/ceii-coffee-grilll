'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { TrendingUp, ShoppingBag, Star, Clock } from 'lucide-react'

export default function AdminShiftSummary() {
  const [summary, setSummary] = useState({ total: 0, count: 0, topProduct: '', topCount: 0, peakHour: '' })

  useEffect(() => {
    async function load() {
      const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
      const { data } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', today)
      if (data && data.length > 0) {
        const total = data.reduce((sum: number, o: any) => sum + o.total, 0)
        const count = data.length

        const productCounts: Record<string, number> = {}
        data.forEach((o: any) => {
          o.items?.forEach((i: any) => {
            productCounts[i.name] = (productCounts[i.name] || 0) + i.qty
          })
        })
        const topEntry = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]

        const hourlyCounts: Record<string, number> = {}
        data.forEach((o: any) => {
          const hour = new Date(o.created_at).getHours()
          hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1
        })
        const peakEntry = Object.entries(hourlyCounts).sort((a, b) => b[1] - a[1])[0]

        setSummary({
          total, count,
          topProduct: topEntry?.[0] || '-',
          topCount: topEntry?.[1] || 0,
          peakHour: peakEntry ? `${peakEntry[0]}:00 - ${Number(peakEntry[0]) + 1}:00` : '-',
        })
      }
    }
    load()
  }, [])

  const items = [
    { label: 'Omzet Hari Ini', value: formatPrice(summary.total), icon: TrendingUp, color: '#27ae60' },
    { label: 'Pesanan Hari Ini', value: summary.count, icon: ShoppingBag, color: '#2980b9' },
    { label: 'Produk Terlaris', value: `${summary.topProduct} (${summary.topCount})`, icon: Star, color: '#D4A73C' },
    { label: 'Jam Tersibuk', value: summary.peakHour, icon: Clock, color: '#e74c3c' },
  ]

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 }}>Ringkasan Shift</h1>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
        {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        {items.map(item => (
          <div key={item.label} style={{
            background: '#fff', borderRadius: 14, padding: 20,
            border: '1px solid #e0ddd5',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <item.icon size={20} color={item.color} />
            </div>
            <p style={{ fontSize: 11, color: '#888', margin: '0 0 4', textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</p>
            <p style={{ fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', margin: 0 }}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
