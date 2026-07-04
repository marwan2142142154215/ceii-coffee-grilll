'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Order } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminOrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadOrders()
  }, [filter])

  async function loadOrders() {
    let query = supabase.from('orders').select('*').eq('status', 'selesai').order('created_at', { ascending: false })
    if (filter === 'today') {
      query = query.gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
    }
    const { data } = await query
    if (data) setOrders(data)
  }

  function exportCSV() {
    const header = 'Nama,Meja,Items,Total,Tanggal\n'
    const rows = orders.map(o => {
      const items = o.items?.map((i: any) => `${i.name} x${i.qty}`).join('; ') || ''
      return `"${o.customer_name}","${o.nomor_meja || ''}","${items}",${o.total},"${new Date(o.created_at).toLocaleString('id-ID')}"`
    }).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'riwayat-pesanan.csv'; a.click()
    URL.revokeObjectURL(url)
    toast.success('File CSV diunduh!')
  }

  const totalOmzet = orders.reduce((sum, o) => sum + o.total, 0)

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', margin: 0 }}>Riwayat Pesanan</h1>
          <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>
            Total: {orders.length} pesanan • Omzet: {formatPrice(totalOmzet)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 12, outline: 'none' }}>
            <option value="all">Semua</option>
            <option value="today">Hari Ini</option>
          </select>
          <button onClick={exportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', background: '#D4A73C', color: '#000', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 'bold', cursor: 'pointer' }}>
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e0ddd5', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f8f7f4' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#666' }}>Tanggal</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#666' }}>Pelanggan</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#666' }}>Items</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', color: '#666' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderTop: '1px solid #f0efe8' }}>
                <td style={{ padding: '8px 12px', color: '#555' }}>{new Date(o.created_at).toLocaleDateString('id-ID')}</td>
                <td style={{ padding: '8px 12px', fontWeight: 'bold', color: '#333' }}>
                  {o.customer_name}
                  {o.nomor_meja && <span style={{ color: '#888', fontWeight: 'normal' }}> (Meja {o.nomor_meja})</span>}
                </td>
                <td style={{ padding: '8px 12px', color: '#555' }}>
                  {o.items?.map((i: any) => `${i.name} x${i.qty}`).join(', ')}
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold', fontFamily: 'monospace' }}>
                  {formatPrice(o.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
