'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/contexts/ThemeContext'

export default function PromoPopup() {
  const { theme } = useTheme()
  const [show, setShow] = useState(false)
  const [banners, setBanners] = useState<any[]>([])
  const [currentBanner, setCurrentBanner] = useState(0)

  useEffect(() => {
    const shown = sessionStorage.getItem('promo_shown')
    if (shown) return

    supabase.from('store_settings').select('banner_promo_active, banner_promo_url').single().then(({ data }: { data: any }) => {
      if (data?.banner_promo_active) {
        supabase.from('banners').select('*').eq('active', true).then(({ data: bannersData }: { data: any }) => {
          if (bannersData && bannersData.length > 0) {
            setBanners(bannersData)
            setShow(true)
            sessionStorage.setItem('promo_shown', 'true')
          }
        })
      }
    })
  }, [])

  if (!show || banners.length === 0) return null

  const banner = banners[currentBanner]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
        onClick={() => setShow(false)}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          style={{
            background: theme.colors.surface,
            borderRadius: 16, maxWidth: 360, width: '100%',
            border: `1px solid ${theme.colors.border}40`,
            overflow: 'hidden',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShow(false)}
              style={{
                position: 'absolute', top: 8, right: 8, zIndex: 10,
                background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                width: 32, height: 32, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#fff',
              }}
            >
              <X size={18} />
            </button>
            {banner.image_url && (
              <img src={banner.image_url} alt={banner.judul}
                style={{ width: '100%', height: 180, objectFit: 'cover' }} />
            )}
          </div>
          <div style={{ padding: '16px 20px 20px' }}>
            <h3 style={{
              fontFamily: theme.font, fontSize: 18, fontWeight: 'bold',
              color: theme.colors.text, margin: 0,
            }}>{banner.judul}</h3>
            {banner.sub_teks && (
              <p style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 6, marginBottom: 0 }}>
                {banner.sub_teks}
              </p>
            )}
            {banners.length > 1 && (
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setCurrentBanner(i)}
                    style={{
                      width: 8, height: 8, borderRadius: '50%', border: 'none',
                      background: i === currentBanner ? theme.colors.accent : theme.colors.textSecondary + '40',
                      cursor: 'pointer', padding: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
