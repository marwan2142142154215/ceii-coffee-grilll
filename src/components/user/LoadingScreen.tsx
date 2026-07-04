'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { supabase } from '@/lib/supabase'

function detectMediaType(url: string): 'image' | 'gif' | 'video' | 'youtube' | 'tiktok' | 'unknown' {
  const ext = url.split('.').pop()?.toLowerCase()
  if (ext === 'gif') return 'gif'
  if (['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(ext || '')) return 'image'
  if (['mp4', 'webm', 'ogg'].includes(ext || '')) return 'video'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('tiktok.com')) return 'tiktok'
  return 'image'
}

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const { theme } = useTheme()
  const [loadingUrl, setLoadingUrl] = useState('')
  const [mediaType, setMediaType] = useState<'image' | 'gif' | 'video' | 'youtube' | 'tiktok' | 'unknown'>('unknown')
  const [show, setShow] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    supabase.from('store_settings').select('loading_media_url').single().then(({ data }: { data: any }) => {
      const url = data?.loading_media_url || ''
      setLoadingUrl(url)
      if (url) {
        setMediaType(detectMediaType(url))
      }
    })

    timerRef.current = setTimeout(() => {
      setShow(false)
      setTimeout(onDone, 500)
    }, 3000)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [onDone])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: theme.colors.background,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          {loadingUrl && mediaType === 'video' ? (
            <video autoPlay muted loop playsInline style={{ maxWidth: 200, maxHeight: 200 }}>
              <source src={loadingUrl} />
            </video>
          ) : loadingUrl && (mediaType === 'image' || mediaType === 'gif') ? (
            <img src={loadingUrl} alt="loading" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 12 }} />
          ) : loadingUrl && mediaType === 'youtube' ? (
            <iframe
              src={`https://www.youtube.com/embed/${loadingUrl.split('v=')[1]?.split('&')[0] || ''}?autoplay=1&mute=1&loop=1`}
              style={{ width: 200, height: 150, borderRadius: 12, border: 'none' }}
              allow="autoplay; muted"
            />
          ) : (
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: 64, marginBottom: 16 }}>🔥</div>
              <h1 style={{
                fontFamily: theme.font, fontSize: 28, fontWeight: 'bold',
                color: theme.colors.accent,
              }}>
                CEII
              </h1>
              <p style={{ color: theme.colors.textSecondary, fontSize: 14, marginTop: 4 }}>
                Coffee & Grill
              </p>
            </motion.div>
          )}
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ marginTop: 24, width: 40, height: 3, borderRadius: 2, background: theme.colors.accent }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
