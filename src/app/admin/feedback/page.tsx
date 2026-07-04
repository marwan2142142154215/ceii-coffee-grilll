'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Order } from '@/types'
import { MessageSquare } from 'lucide-react'

export default function AdminFeedback() {
  const [orders, setOrders] = useState<any[]>([])
  const [productFilter, setProductFilter] = useState('all')

  useEffect(() => {
    supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }: { data: any }) => {
      if (data) setOrders(data.filter((o: any) => o.items?.some((i: any) => i.catatan) || o.catatan))
    })
  }, [])

  const allProducts = [...new Set(orders.flatMap(o => o.items?.map((i: any) => i.name) || []))]
  const filteredOrders = productFilter === 'all'
    ? orders
    : orders.filter(o => o.items?.some((i: any) => i.name === productFilter))

  function getProductNotes(order: Order) {
    return order.items?.filter((i: any) => i.catatan).map((i: any) => ({ product: i.name, note: i.catatan })) || []
  }

  const allCatatans: string[] = orders.flatMap(o => {
    const items = (o.items || []) as any[]
    return items.filter((i: any) => i.catatan).map((i: any) => i.catatan)
  })
  const noteFrequency: Record<string, number> = allCatatans.reduce((acc, n) => {
    acc[n] = (acc[n] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 }}>Feedback Pelanggan</h1>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
        Catatan dan permintaan khusus dari pelanggan
      </p>

      {Object.keys(noteFrequency).length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e0ddd5', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 'bold', color: '#333', margin: '0 0 8' }}>Catatan yang Sering Muncul</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(noteFrequency).sort((a: [string, number], b: [string, number]) => b[1] - a[1]).slice(0, 10).map(([note, freq]) => (
              <span key={note} style={{
                padding: '4px 12px', background: '#D4A73C15', borderRadius: 20,
                border: '1px solid #D4A73C30', fontSize: 12, color: '#7A5A1E',
              }}>
                "{note}" × {freq}
              </span>
            ))}
          </div>
        </div>
      )}

      <select value={productFilter} onChange={e => setProductFilter(e.target.value)}
        style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none', marginBottom: 16 }}>
        <option value="all">Semua Produk</option>
        {allProducts.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filteredOrders.map(order => {
          const productNotes = getProductNotes(order)
          if (productNotes.length === 0 && !order.catatan) return null
          return (
            <div key={order.id} style={{
              background: '#fff', borderRadius: 10, padding: 12,
              border: '1px solid #e0ddd5',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <MessageSquare size={14} color="#D4A73C" />
                <span style={{ fontSize: 13, fontWeight: 'bold', color: '#333' }}>{order.customer_name}</span>
                <span style={{ fontSize: 11, color: '#888' }}>{new Date(order.created_at).toLocaleDateString('id-ID')}</span>
              </div>
              {productNotes.map((n, i) => (
                <div key={i} style={{ fontSize: 12, color: '#555', padding: '2px 0' }}>
                  <strong>{n.product}</strong>: {n.note}
                </div>
              ))}
              {order.catatan && (
                <div style={{ fontSize: 12, color: '#D4A73C', fontStyle: 'italic', marginTop: 4 }}>
                  Catatan umum: {order.catatan}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
