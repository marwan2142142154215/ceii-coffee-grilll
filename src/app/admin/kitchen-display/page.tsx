'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Order } from '@/types'
import { Clock, CheckCircle, CookingPot, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<Order[]>([])
  const [doneOrders, setDoneOrders] = useState<Order[]>([])
  const [tab, setTab] = useState<'active' | 'done'>('active')
  const [pin, setPin] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [correctPin, setCorrectPin] = useState('1234')

  useEffect(() => {
    supabase.from('store_settings').select('kitchen_pin').single().then(({ data }: { data: any }) => {
      if (data?.kitchen_pin) setCorrectPin(data.kitchen_pin)
    })
  }, [])

  useEffect(() => {
    if (!authenticated) return
    loadOrders()
    const sub = supabase.channel('kitchen-orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      loadOrders()
      tryPlayNotification()
    }).subscribe()
    return () => { sub.unsubscribe() }
  }, [authenticated])

  async function loadOrders() {
    const { data } = await supabase.from('orders')
      .select('*')
      .in('status', ['baru', 'diterima', 'dimasak', 'selesai'])
      .order('created_at', { ascending: true })
    const raw = (data || []) as any[]
    if (raw.length > 0) {
      setOrders(raw.filter((o: any) => o.status !== 'selesai'))
      setDoneOrders(raw.filter((o: any) => o.status === 'selesai').reverse())
    }
  }

  function tryPlayNotification() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAC')
      audio.volume = 0.5
      audio.play()
    } catch {}
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) { toast.error('Gagal: ' + error.message); return }
    toast.success(`Status diubah ke ${status}`)
    loadOrders()
  }

  function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pin === correctPin) {
      setAuthenticated(true)
    } else {
      toast.error('PIN salah!')
    }
  }

  if (!authenticated) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#1A1A1A',
      }}>
        <form onSubmit={handlePinSubmit}
          style={{ background: '#2A2A2A', padding: '32px 24px', borderRadius: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
          <h2 style={{ color: '#F5F0E8', fontSize: 18, margin: '0 0 4', fontWeight: 'bold' }}>PIN Dapur</h2>
          <p style={{ color: '#888', fontSize: 12, margin: '0 0 16' }}>Masukkan PIN untuk akses kitchen display</p>
          <input type="password" value={pin} onChange={e => setPin(e.target.value)}
            maxLength={6}
            style={{
              width: 160, padding: '10px', textAlign: 'center', fontSize: 24,
              borderRadius: 10, border: '1px solid #D4A73C', background: '#1A1A1A',
              color: '#F5F0E8', outline: 'none', letterSpacing: 8,
            }}
            autoFocus />
          <button type="submit"
            style={{ display: 'block', margin: '16px auto 0', padding: '10px 32px', background: '#D4A73C', color: '#000', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 'bold', cursor: 'pointer' }}>
            Buka
          </button>
        </form>
      </div>
    )
  }

  const activeOrders = orders.filter(o => o.status === 'diterima' || o.status === 'dimasak' || o.status === 'baru')

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ color: '#D4A73C', fontSize: 20, fontFamily: 'serif', margin: 0 }}>🔥 Dapur</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('active')}
            style={{
              padding: '6px 16px', borderRadius: 8, border: 'none',
              background: tab === 'active' ? '#D4A73C' : '#2A2A2A',
              color: tab === 'active' ? '#000' : '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: 12,
            }}>
            Aktif ({activeOrders.length})
          </button>
          <button onClick={() => setTab('done')}
            style={{
              padding: '6px 16px', borderRadius: 8, border: 'none',
              background: tab === 'done' ? '#D4A73C' : '#2A2A2A',
              color: tab === 'done' ? '#000' : '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: 12,
            }}>
            Selesai ({doneOrders.length})
          </button>
        </div>
      </div>

      {tab === 'active' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {activeOrders.length === 0 ? (
            <p style={{ color: '#555', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>
              Tidak ada pesanan aktif 🎉
            </p>
          ) : (
            activeOrders.map(order => {
              const elapsed = Date.now() - new Date(order.created_at).getTime()
              const minutes = Math.floor(elapsed / 60000)
              const isLongWaiting = minutes > 15

              return (
                <div key={order.id} style={{
                  background: '#1A1A1A', borderRadius: 12, padding: 16,
                  border: `2px solid ${isLongWaiting ? '#e74c3c' : '#2A2A2A'}`,
                  boxShadow: isLongWaiting ? '0 0 15px rgba(231,76,60,0.3)' : 'none',
                }}>
                  {isLongWaiting && (
                    <div style={{ background: '#e74c3c', color: '#fff', fontSize: 10, fontWeight: 'bold', padding: '2px 8px', borderRadius: 6, display: 'inline-block', marginBottom: 6 }}>
                      ⚠️ MENUNGGU LAMA ({minutes} MENIT)
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <h3 style={{ color: '#F5F0E8', fontSize: 16, fontWeight: 'bold', margin: 0 }}>
                        {order.customer_name}
                      </h3>
                      {order.nomor_meja && (
                        <p style={{ color: '#D4A73C', fontSize: 12, margin: '2px 0' }}>Meja #{order.nomor_meja}</p>
                      )}
                    </div>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 6,
                      background: order.status === 'baru' ? '#e74c3c' : order.status === 'diterima' ? '#f39c12' : '#3498db',
                      color: '#fff', fontWeight: 'bold', height: 'fit-content',
                    }}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: 13, color: '#B8AFA0', marginBottom: 12 }}>
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} style={{ padding: '2px 0', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong style={{ color: '#F5F0E8' }}>{item.qty}x</strong> {item.name}</span>
                        {item.catatan && <span style={{ color: '#D4A73C', fontSize: 11, fontStyle: 'italic' }}>{item.catatan}</span>}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#555', fontSize: 11 }}>
                      <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                      {minutes} menit lalu
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {order.status === 'baru' && (
                        <button onClick={() => updateStatus(order.id, 'diterima')}
                          style={{ padding: '6px 12px', background: '#f39c12', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 'bold', cursor: 'pointer' }}>
                          Terima
                        </button>
                      )}
                      {order.status === 'diterima' && (
                        <button onClick={() => updateStatus(order.id, 'dimasak')}
                          style={{ padding: '6px 12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CookingPot size={14} /> Masak
                        </button>
                      )}
                      {order.status === 'dimasak' && (
                        <button onClick={() => updateStatus(order.id, 'selesai')}
                          style={{ padding: '6px 12px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle size={14} /> Selesai
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
          {doneOrders.map(order => (
            <div key={order.id} style={{
              background: '#1A1A1A', borderRadius: 12, padding: 12,
              border: '1px solid #2A2A2A', opacity: 0.7,
            }}>
              <p style={{ color: '#27ae60', fontSize: 12, fontWeight: 'bold', margin: '0 0 4' }}>✅ Selesai</p>
              <h3 style={{ color: '#B8AFA0', fontSize: 14, margin: 0 }}>{order.customer_name}</h3>
              <p style={{ color: '#555', fontSize: 11, margin: '4px 0 0' }}>
                {order.items?.length} item • Rp {order.total.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
