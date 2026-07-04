'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, Globe, ShoppingCart } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useCart } from '@/contexts/CartContext'
import { supabase } from '@/lib/supabase'
import { StoreSettings } from '@/types'

export default function Header({ onCartClick }: { onCartClick: () => void }) {
  const { theme } = useTheme()
  const { totalItems } = useCart()
  const [settings, setSettings] = useState<StoreSettings | null>(null)

  useEffect(() => {
    supabase.from('store_settings').select('*').single().then(({ data }: { data: any }) => {
      setSettings(data)
    })

    const sub = supabase.channel('settings-header').on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'store_settings',
    }, (payload: any) => {
      setSettings(payload.new as StoreSettings)
    }).subscribe()

    return () => { sub.unsubscribe() }
  }, [])

  return (
    <header style={{
      background: `linear-gradient(135deg, ${theme.colors.secondary}, ${theme.colors.background})`,
      borderBottom: `1px solid ${theme.colors.border}30`,
      padding: '12px 16px',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {settings?.store_logo_url ? (
            <img src={settings.store_logo_url} alt="logo"
              style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: theme.colors.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>🔥</div>
          )}
          <div>
            <h1 style={{
              fontFamily: theme.font, fontSize: 16, fontWeight: 'bold',
              color: theme.colors.text, margin: 0, lineHeight: 1.2,
            }}>
              {settings?.store_name || 'CEII Coffee & Grill'}
            </h1>
            {settings?.jam_operasional && (
              <p style={{ color: theme.colors.textSecondary, fontSize: 11, margin: 0 }}>
                {settings.jam_operasional}
              </p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {settings?.whatsapp_number && (
            <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noopener"
              style={{ color: '#25D366', padding: 6 }}>
              <MessageCircle size={18} />
            </a>
          )}
          {settings?.telegram_link && (
            <a href={settings.telegram_link} target="_blank" rel="noopener"
              style={{ color: '#0088cc', padding: 6 }}>
              <Send size={18} />
            </a>
          )}
          {settings?.instagram_link && (
            <a href={settings.instagram_link} target="_blank" rel="noopener"
              style={{ color: '#E4405F', padding: 6 }} title="Instagram">
              <Globe size={18} />
            </a>
          )}
          {settings?.facebook_link && (
            <a href={settings.facebook_link} target="_blank" rel="noopener"
              style={{ color: '#1877F2', padding: 6 }} title="Facebook">
              <Globe size={18} />
            </a>
          )}
          <button onClick={onCartClick}
            style={{
              position: 'relative', background: theme.colors.accent + '20',
              border: `1px solid ${theme.colors.accent}50`, borderRadius: 12,
              padding: '8px 10px', cursor: 'pointer', color: theme.colors.accent,
              marginLeft: 4, display: 'flex', alignItems: 'center', gap: 4,
            }}>
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: theme.colors.accent, color: '#000',
                fontSize: 10, fontWeight: 'bold', borderRadius: '50%',
                width: 18, height: 18, display: 'flex', alignItems: 'center',
                justifyContent: 'center',
              }}>{totalItems}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
