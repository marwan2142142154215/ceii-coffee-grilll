'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import toast from 'react-hot-toast'
import { Check, X } from 'lucide-react'

export default function AdminPromo() {
  const [products, setProducts] = useState<Product[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [promoPrice, setPromoPrice] = useState('')

  useEffect(() => {
    loadData()
    const sub = supabase.channel('admin-promo').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => loadData()).subscribe()
    return () => { sub.unsubscribe() }
  }, [])

  async function loadData() {
    const { data } = await supabase.from('products').select('*').order('order')
    if (data) setProducts(data)
  }

  async function togglePromo(p: Product) {
    if (p.is_promo) {
      const { error } = await supabase.from('products').update({ is_promo: false, promo_price: null }).eq('id', p.id)
      if (error) { toast.error('Gagal: ' + error.message); return }
      toast.success('Promo dinonaktifkan')
    } else {
      setEditingId(p.id)
      setPromoPrice('')
    }
    loadData()
  }

  async function savePromo() {
    if (!promoPrice || Number(promoPrice) < 0) {
      toast.error('Harga promo harus valid')
      return
    }
    const product = products.find(p => p.id === editingId)
    if (!product) return
    if (Number(promoPrice) >= product.price) {
      toast.error('Harga promo harus lebih rendah dari harga asli')
      return
    }
    const { error } = await supabase.from('products').update({ is_promo: true, promo_price: Number(promoPrice) }).eq('id', editingId)
    if (error) { toast.error('Gagal: ' + error.message); return }
    toast.success('Promo diaktifkan!')
    setEditingId(null)
    loadData()
  }

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 20 }}>Kelola Promo</h1>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
        Atur produk yang ingin ditampilkan sebagai promo di menu pelanggan
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {products.map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#fff', borderRadius: 12, padding: '12px 16px',
            border: p.is_promo ? '1.5px solid #D4A73C' : '1px solid #e0ddd5',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 'bold', color: '#1A1A1A' }}>{p.name}</span>
                {p.is_promo && <span style={{ fontSize: 10, background: '#D4A73C', color: '#000', padding: '1px 8px', borderRadius: 4, fontWeight: 'bold' }}>PROMO</span>}
              </div>
              <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>
                Harga asli: Rp {p.price.toLocaleString()}
                {p.is_promo && p.promo_price ? ` → Rp ${p.promo_price.toLocaleString()}` : ''}
              </p>
            </div>

            {editingId === p.id ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="number" value={promoPrice} onChange={e => setPromoPrice(e.target.value)}
                  placeholder="Harga promo"
                  style={{ width: 100, padding: '6px 10px', borderRadius: 8, border: '1px solid #D4A73C', fontSize: 12, outline: 'none' }}
                  autoFocus
                />
                <button onClick={savePromo}
                  style={{ background: '#D4A73C', color: '#000', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>
                  <Check size={14} />
                </button>
                <button onClick={() => setEditingId(null)}
                  style={{ background: '#eee', color: '#666', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button onClick={() => togglePromo(p)}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: 'none',
                  background: p.is_promo ? '#fde8e8' : '#f0efe8',
                  color: p.is_promo ? '#e74c3c' : '#555',
                  fontSize: 12, fontWeight: 'bold', cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}>
                {p.is_promo ? 'Nonaktifkan' : 'Jadikan Promo'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
