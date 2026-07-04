'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Category, Product, StoreSettings } from '@/types'
import { useTheme } from '@/contexts/ThemeContext'
import LoadingScreen from '@/components/user/LoadingScreen'
import PromoPopup from '@/components/user/PromoPopup'
import Header from '@/components/user/Header'
import MenuCard from '@/components/user/MenuCard'
import CartDrawer from '@/components/user/CartDrawer'

export default function HomePage() {
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [storeClosed, setStoreClosed] = useState(false)
  const [settings, setSettings] = useState<StoreSettings | null>(null)

  const fetchData = useCallback(async () => {
    const [catRes, prodRes, storeRes] = await Promise.all([
      supabase.from('categories').select('*').order('order'),
      supabase.from('products').select('*').order('order'),
      supabase.from('store_settings').select('*').single(),
    ])
    if (catRes.data) setCategories(catRes.data)
    if (prodRes.data) setProducts(prodRes.data)
    if (storeRes.data) {
      setSettings(storeRes.data)
      setStoreClosed(storeRes.data.store_closed || false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    const catSub = supabase.channel('user-categories').on('postgres_changes', {
      event: '*', schema: 'public', table: 'categories',
    }, () => fetchData()).subscribe()

    const prodSub = supabase.channel('user-products').on('postgres_changes', {
      event: '*', schema: 'public', table: 'products',
    }, () => fetchData()).subscribe()

    const storeSub = supabase.channel('user-store').on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'store_settings',
    }, (payload: any) => {
      const newData = payload.new as StoreSettings
      setSettings(newData)
      setStoreClosed(newData.store_closed || false)
    }).subscribe()

    const timer = setTimeout(() => setLoading(false), 500)

    return () => {
      clearTimeout(timer)
      catSub.unsubscribe()
      prodSub.unsubscribe()
      storeSub.unsubscribe()
    }
  }, [fetchData])

  const filteredProducts = products.filter(p => {
    const matchCategory = activeCategory === 'all' || p.category_id === activeCategory
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  if (loading) return <LoadingScreen onDone={() => setLoading(false)} />

  return (
    <>
      <PromoPopup />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <Header onCartClick={() => setCartOpen(true)} />

      {storeClosed && (
        <div style={{
          background: '#e74c3c', color: '#fff', textAlign: 'center',
          padding: '10px 16px', fontSize: 13, fontWeight: 'bold',
        }}>
          🚧 Toko Sedang Tutup — Belum bisa melakukan pemesanan
        </div>
      )}

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px 100px', position: 'relative' }}>
        <div style={{ position: 'relative', margin: '12px 0 16px' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.colors.textSecondary }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari menu..."
            style={{
              width: '100%', padding: '10px 12px 10px 36px', borderRadius: 12,
              border: `1px solid ${theme.colors.border}20`,
              background: theme.colors.surface, color: theme.colors.text,
              fontSize: 14, outline: 'none',
            }}
          />
        </div>

        <div style={{
          display: 'flex', gap: 8, overflow: 'auto', paddingBottom: 12,
          marginBottom: 8, scrollbarWidth: 'none',
        }} className="scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            style={{
              padding: '7px 16px', borderRadius: 20, border: 'none',
              background: activeCategory === 'all' ? theme.colors.accent : theme.colors.surface,
              color: activeCategory === 'all' ? '#000' : theme.colors.text,
              fontSize: 13, fontWeight: 'bold', cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'all 0.2s',
            }}
          >
            Semua
          </button>
          {categories.filter(c => c.name !== 'Semua').map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '7px 16px', borderRadius: 20, border: 'none',
                background: activeCategory === cat.id ? theme.colors.accent : theme.colors.surface,
                color: activeCategory === cat.id ? '#000' : theme.colors.text,
                fontSize: 13, fontWeight: 'bold', cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all 0.2s',
              }}
            >
              {cat.icon && <span style={{ marginRight: 4 }}>{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 40, color: theme.colors.textSecondary,
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 14 }}>Menu tidak ditemukan</p>
            <p style={{ fontSize: 12 }}>Coba kata kunci lain</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {filteredProducts.map(product => (
              <MenuCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
