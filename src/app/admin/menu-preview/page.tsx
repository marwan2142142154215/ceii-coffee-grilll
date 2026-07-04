'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Category, Product, Theme } from '@/types'
import { themes, getThemeById } from '@/lib/themes'

export default function AdminMenuPreview() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [themeId, setThemeId] = useState('japanese')
  const theme = getThemeById(themeId)

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('*').order('order'),
      supabase.from('products').select('*').order('order'),
    ]).then(([catRes, prodRes]) => {
      if (catRes.data) setCategories(catRes.data)
      if (prodRes.data) setProducts(prodRes.data)
    })
  }, [])

  if (!theme) return null

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 }}>Preview Menu</h1>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
        Simulasi tampilan Web User dari sisi pelanggan
      </p>

      <select value={themeId} onChange={e => setThemeId(e.target.value)}
        style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none', marginBottom: 16 }}>
        {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      <div style={{
        background: theme.colors.background,
        borderRadius: 16, border: `1px solid ${theme.colors.border}30`,
        overflow: 'hidden', maxWidth: 420,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${theme.colors.secondary}, ${theme.colors.background})`,
          padding: '10px 14px', borderBottom: `1px solid ${theme.colors.border}30`,
        }}>
          <h2 style={{ fontFamily: theme.font, fontSize: 15, fontWeight: 'bold', color: theme.colors.text, margin: 0 }}>
            🔥 CEII Coffee & Grill
          </h2>
        </div>

        <div style={{ padding: 12 }}>
          {products.slice(0, 4).map(p => {
            const price = p.is_promo && p.promo_price ? p.promo_price : p.price
            return (
              <div key={p.id} style={{
                display: 'flex', gap: 10, padding: '8px 0',
                borderBottom: `1px solid ${theme.colors.border}10`,
                opacity: p.is_available ? 1 : 0.5,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 10,
                  background: `linear-gradient(135deg, ${theme.colors.secondary}, ${theme.colors.background})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  flexShrink: 0,
                }}>
                  🍽️
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: theme.font, fontSize: 13, fontWeight: 'bold', color: theme.colors.text, margin: 0 }}>
                    {p.name}
                    {!p.is_available && <span style={{ color: '#e74c3c', fontSize: 10, marginLeft: 6 }}>HABIS</span>}
                  </h3>
                  <p style={{ color: theme.colors.textSecondary, fontSize: 11, margin: '2px 0' }}>{p.description || ''}</p>
                  <span style={{ color: p.is_promo ? theme.colors.accent : theme.colors.text, fontSize: 13, fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
                    Rp {price.toLocaleString()}
                    {p.is_promo && p.promo_price && (
                      <span style={{ color: theme.colors.textSecondary, fontSize: 11, textDecoration: 'line-through', marginLeft: 6 }}>
                        Rp {p.price.toLocaleString()}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
