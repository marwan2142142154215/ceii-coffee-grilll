'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Order } from '@/types'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [tab, setTab] = useState<'active' | 'done'>('active')

  useEffect(() => {
    loadOrders()
    const sub = supabase.channel('admin-orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadOrders()).subscribe()
    return () => { sub.unsubscribe() }
  }, [])

  async function loadOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (data) setOrders(data)
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) { toast.error('Gagal update status: ' + error.message); return }
    loadOrders()
  }

  const statusColors: Record<string, string> = {
    baru: '#e74c3c', diterima: '#f39c12', dimasak: '#3498db', selesai: '#27ae60',
  }

  const activeOrders = orders.filter(o => o.status !== 'selesai')
  const doneOrders = orders.filter(o => o.status === 'selesai')

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 }}>Pesanan</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab('active')}
          style={{
            padding: '7px 18px', borderRadius: 8, border: 'none',
            background: tab === 'active' ? '#D4A73C' : '#eee',
            color: tab === 'active' ? '#000' : '#666',
            fontWeight: 'bold', fontSize: 13, cursor: 'pointer',
          }}>
          Aktif ({activeOrders.length})
        </button>
        <button onClick={() => setTab('done')}
          style={{
            padding: '7px 18px', borderRadius: 8, border: 'none',
            background: tab === 'done' ? '#27ae60' : '#eee',
            color: tab === 'done' ? '#fff' : '#666',
            fontWeight: 'bold', fontSize: 13, cursor: 'pointer',
          }}>
          Selesai ({doneOrders.length})
        </button>
      </div>

      {tab === 'active' ? (
        activeOrders.length === 0 ? (
          <p style={{ color: '#888', fontSize: 14 }}>Tidak ada pesanan aktif</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeOrders.map(order => (
              <div key={order.id} style={{
                background: '#fff', borderRadius: 12, padding: 16,
                border: `1px solid ${statusColors[order.status]}40`,
                borderLeft: `4px solid ${statusColors[order.status]}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <strong style={{ fontSize: 13 }}>{order.customer_name}</strong>
                    {order.nomor_meja && <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>Meja #{order.nomor_meja}</span>}
                  </div>
                  <span style={{
                    fontSize: 11, padding: '2px 10px', borderRadius: 10,
                    background: `${statusColors[order.status]}20`,
                    color: statusColors[order.status], fontWeight: 'bold',
                  }}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span>{item.name} x{item.qty}{item.catatan ? ` (${item.catatan})` : ''}</span>
                      <span style={{ fontFamily: 'monospace' }}>Rp {(item.harga * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace' }}>
                    Total: {formatPrice(order.total)}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {order.status === 'baru' && (
                      <button onClick={() => updateStatus(order.id, 'diterima')}
                        style={{ padding: '4px 12px', background: '#f39c12', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>
                        Terima
                      </button>
                    )}
                    {order.status === 'diterima' && (
                      <button onClick={() => updateStatus(order.id, 'dimasak')}
                        style={{ padding: '4px 12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>
                        Masak
                      </button>
                    )}
                    {order.status === 'dimasak' && (
                      <button onClick={() => updateStatus(order.id, 'selesai')}
                        style={{ padding: '4px 12px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>
                        Selesai
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: 10, color: '#aaa', margin: '6px 0 0' }}>
                  {new Date(order.created_at).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
        )
      ) : (
        doneOrders.length === 0 ? (
          <p style={{ color: '#888', fontSize: 14 }}>Belum ada pesanan selesai</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {doneOrders.map(order => (
              <div key={order.id} style={{
                background: '#fff', borderRadius: 10, padding: 12,
                border: '1px solid #e0ddd5', opacity: 0.75,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div>
                    <strong style={{ fontSize: 13, color: '#333' }}>{order.customer_name}</strong>
                    {order.nomor_meja && <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>Meja #{order.nomor_meja}</span>}
                  </div>
                  <span style={{ fontSize: 10, color: '#27ae60', fontWeight: 'bold' }}>✅ SELESAI</span>
                </div>
                <div style={{ fontSize: 11, color: '#888' }}>
                  {order.items?.length} item • Total {formatPrice(order.total)}
                </div>
                <p style={{ fontSize: 10, color: '#bbb', margin: '4px 0 0' }}>
                  {new Date(order.created_at).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
