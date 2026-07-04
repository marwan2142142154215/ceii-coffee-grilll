'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Theme, ThemeId } from '@/types'
import { themes, getRandomTheme } from '@/lib/themes'
import { supabase } from '@/lib/supabase'

interface ThemeContextType {
  theme: Theme
  setThemeId: (id: ThemeId) => void
  availableThemes: ThemeId[]
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes[0],
  setThemeId: () => {},
  availableThemes: [],
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(themes[0])
  const [availableThemes, setAvailableThemes] = useState<ThemeId[]>([])

  useEffect(() => {
    supabase.from('store_settings').select('active_themes').single().then(({ data }: { data: any }) => {
      if (data?.active_themes) {
        setAvailableThemes(data.active_themes as ThemeId[])
        const t = getRandomTheme(data.active_themes)
        setTheme(t)
      } else {
        setAvailableThemes(themes.map(t => t.id))
        const t = getRandomTheme(themes.map(t => t.id))
        setTheme(t)
      }
    })

    const sub = supabase.channel('settings-theme').on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'store_settings',
      filter: `id=eq.${1}`,
    }, (payload: any) => {
      const newActive = payload.new as any
      if (newActive?.active_themes) {
        setAvailableThemes(newActive.active_themes as ThemeId[])
      }
    }).subscribe()

    return () => { sub.unsubscribe() }
  }, [])

  function setThemeId(id: ThemeId) {
    const t = themes.find(th => th.id === id)
    if (t) setTheme(t)
  }

  useEffect(() => {
    const root = document.documentElement
    const c = theme.colors
    root.style.setProperty('--theme-primary', c.primary)
    root.style.setProperty('--theme-secondary', c.secondary)
    root.style.setProperty('--theme-accent', c.accent)
    root.style.setProperty('--theme-bg', c.background)
    root.style.setProperty('--theme-surface', c.surface)
    root.style.setProperty('--theme-text', c.text)
    root.style.setProperty('--theme-text-secondary', c.textSecondary)
    root.style.setProperty('--theme-border', c.border)
    root.style.setProperty('--theme-promo', c.promo)
    root.style.setProperty('--theme-glow', c.glow)
    root.style.setProperty('--theme-font', theme.font)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setThemeId, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
