'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Heart } from 'lucide-react'

export default function AdminLoyalty() {
  const [customers, setCustomers] = useState<{ name: string; totalOrders: number; totalSpent: number; lastOrder: string }[]>([])

  useEffect(() => {
    supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }: { data: any }) => {
      if (!data) return
      const grouped: Record<string, { count: number; total: number; last: string }> = {}
      data.forEach((o: any) => {
        const name = o.customer_name
        if (!grouped[name]) grouped[name] = { count: 0, total: 0, last: '' }
        grouped[name].count++
        grouped[name].total += o.total
        if (!grouped[name].last || new Date(o.created_at) > new Date(grouped[name].last)) {
          grouped[name].last = o.created_at
        }
      })
      const sorted = Object.entries(grouped)
        .filter(([_, v]) => v.count > 1)
        .sort((a, b) => b[1].count - a[1].count)
        .map(([name, data]) => ({ name, totalOrders: data.count, totalSpent: data.total, lastOrder: data.last }))
      setCustomers(sorted)
    })
  }, [])

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Heart size={20} color="#e74c3c" />
        <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', margin: 0 }}>Pelanggan Setia</h1>
      </div>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 16, fontStyle: 'italic' }}>
        *Berdasarkan nama yang diinput, bukan akun terverifikasi
      </p>

      {customers.length === 0 ? (
        <p style={{ color: '#888', fontSize: 14 }}>Belum ada pelanggan yang order lebih dari 1 kali</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {customers.map(c => (
            <div key={c.name} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#fff', borderRadius: 12, padding: '12px 16px',
              border: '1px solid #e0ddd5',
            }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', margin: 0 }}>{c.name}</h3>
                <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>
                  Terakhir: {new Date(c.lastOrder).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 14, fontWeight: 'bold', color: '#D4A73C', margin: 0 }}>
                  {c.totalOrders}x pesan
                </p>
                <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
                  {formatPrice(c.totalSpent)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
