'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import { Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
    const sub = supabase.channel('admin-inventory').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => loadData()).subscribe()
    return () => { sub.unsubscribe() }
  }, [])

  async function loadData() {
    const { data } = await supabase.from('products').select('*').order('order')
    if (data) setProducts(data)
  }

  async function toggleAvailability(p: Product) {
    const { error } = await supabase.from('products').update({ is_available: !p.is_available }).eq('id', p.id)
    if (error) { toast.error('Gagal: ' + error.message); return }
    toast.success(`${p.name} → ${!p.is_available ? 'Tersedia' : 'Habis'}`)
    loadData()
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 }}>Manajemen Stok</h1>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
        Toggle cepat ketersediaan produk
      </p>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari produk..."
          style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 10, border: '1px solid #ddd', fontSize: 13, outline: 'none' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#fff', borderRadius: 10, padding: '10px 14px',
            border: '1px solid #e0ddd5',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {p.image_url ? (
                <img src={p.image_url} alt={p.name}
                  style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0efe8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🍽️</div>
              )}
              <div>
                <p style={{ fontSize: 13, fontWeight: 'bold', color: '#1A1A1A', margin: 0 }}>{p.name}</p>
                <p style={{ fontSize: 11, color: '#888', margin: 0 }}>Rp {p.price.toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={() => toggleAvailability(p)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none',
                background: p.is_available ? '#27ae60' : '#e74c3c',
                color: '#fff', fontSize: 12, fontWeight: 'bold', cursor: 'pointer',
                minWidth: 70,
              }}
            >
              {p.is_available ? 'Tersedia' : 'Habis'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
