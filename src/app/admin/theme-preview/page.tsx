'use client'

import { useState } from 'react'
import { themes, getThemeById } from '@/lib/themes'
import { ThemeId } from '@/types'
import { Check } from 'lucide-react'

export default function AdminThemePreview() {
  const [selected, setSelected] = useState<ThemeId>('japanese')

  const theme = getThemeById(selected)

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 20 }}>Preview Tema</h1>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
        Lihat pratinjau tampilan setiap tema sebelum mengaktifkannya
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {themes.map(t => (
          <button key={t.id} onClick={() => setSelected(t.id)}
            style={{
              padding: '8px 16px', borderRadius: 10, border: `2px solid ${selected === t.id ? t.colors.accent : '#ddd'}`,
              background: t.colors.surface, color: t.colors.text, cursor: 'pointer',
              fontFamily: t.font, fontSize: 13, fontWeight: 'bold',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
            {selected === t.id && <Check size={14} color={t.colors.accent} />}
            {t.name}
          </button>
        ))}
      </div>

      {theme && (
        <div style={{
          background: theme.colors.background,
          borderRadius: 16, padding: 24,
          border: `1px solid ${theme.colors.border}40`,
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${theme.colors.secondary}, ${theme.colors.background})`,
            borderRadius: 12, padding: 16, marginBottom: 16,
            borderBottom: `1px solid ${theme.colors.border}30`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: theme.colors.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>🔥</div>
              <div>
                <h2 style={{ fontFamily: theme.font, fontSize: 16, fontWeight: 'bold', color: theme.colors.text, margin: 0 }}>
                  CEII Coffee & Grill
                </h2>
                <p style={{ color: theme.colors.textSecondary, fontSize: 11, margin: 0 }}>
                  Preview — {theme.name}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: theme.colors.surface,
                borderRadius: 12, overflow: 'hidden',
                border: i === 2 ? `1.5px solid ${theme.colors.border}` : '1px solid transparent',
                boxShadow: i === 2 ? `0 0 15px ${theme.colors.glow}` : 'none',
              }}>
                <div style={{
                  aspectRatio: '1/1',
                  background: `linear-gradient(135deg, ${theme.colors.secondary}, ${theme.colors.background})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 36,
                }}>
                  {['🥩', '☕', '🍟'][i - 1]}
                </div>
                <div style={{ padding: '8px 10px 10px' }}>
                  <h3 style={{ fontFamily: theme.font, fontSize: 13, fontWeight: 'bold', color: theme.colors.text, margin: 0 }}>
                    {['Paket Grill', 'Coffee', 'Snack'][i - 1]}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{
                      color: i === 2 ? theme.colors.accent : theme.colors.text,
                      fontSize: 13, fontWeight: 'bold', fontFamily: 'var(--font-mono)',
                    }}>
                      Rp {['45.000', '25.000', '15.000'][i - 1]}
                    </span>
                    {i === 2 && (
                      <span style={{ fontSize: 10, color: theme.colors.textSecondary, textDecoration: 'line-through', marginRight: 6 }}>
                        Rp 35.000
                      </span>
                    )}
                    <button style={{
                      background: theme.colors.accent, border: 'none', borderRadius: 8,
                      padding: '4px 10px', color: '#000', fontSize: 11, fontWeight: 'bold', cursor: 'pointer',
                    }}>
                      Tambah
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: 12, background: theme.colors.surface, borderRadius: 12 }}>
            <p style={{ fontSize: 11, color: theme.colors.textSecondary, marginBottom: 6 }}>Palet Warna</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(theme.colors).slice(0, 6).map(([key, val]) => (
                <div key={key} style={{ textAlign: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: val, border: '1px solid rgba(255,255,255,0.1)' }} />
                  <p style={{ fontSize: 8, color: theme.colors.textSecondary, margin: '2px 0 0' }}>{key}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
