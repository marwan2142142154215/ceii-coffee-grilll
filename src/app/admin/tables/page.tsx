'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Order } from '@/types'

export default function AdminTables() {
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [totalTables, setTotalTables] = useState(20)

  useEffect(() => {
    loadOrders()
    const sub = supabase.channel('admin-tables').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadOrders()).subscribe()
    return () => { sub.unsubscribe() }
  }, [])

  async function loadOrders() {
    const { data } = await supabase.from('orders')
      .select('*')
      .in('status', ['baru', 'diterima', 'dimasak'])
      .not('nomor_meja', 'is', null)
    if (data) setActiveOrders(data)
  }

  const occupiedTables = new Set(activeOrders.map(o => o.nomor_meja))

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 20 }}>Status Meja</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10 }}>
        {Array.from({ length: totalTables }, (_, i) => {
          const tableNum = String(i + 1)
          const isOccupied = occupiedTables.has(tableNum)
          return (
            <div key={tableNum} style={{
              padding: 16, borderRadius: 12, textAlign: 'center',
              background: isOccupied ? '#fde8e8' : '#f0faf0',
              border: `2px solid ${isOccupied ? '#e74c3c' : '#27ae60'}`,
              color: isOccupied ? '#e74c3c' : '#27ae60',
              fontWeight: 'bold', fontSize: 18,
              transition: 'all 0.2s',
            }}>
              {tableNum}
              <div style={{ fontSize: 9, fontWeight: 'normal', marginTop: 2 }}>
                {isOccupied ? 'Terisi' : 'Kosong'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
