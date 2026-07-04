import { Theme } from '@/types'

export const themes: Theme[] = [
  {
    id: 'japanese',
    name: 'Japanese Grill House',
    colors: {
      primary: '#7A1E1E',
      secondary: '#3D0C0C',
      accent: '#D4A73C',
      background: '#0D0D0D',
      surface: '#1A1A1A',
      text: '#F5F0E8',
      textSecondary: '#B8AFA0',
      border: '#D4A73C',
      promo: '#D4A73C',
      glow: 'rgba(212, 167, 60, 0.3)',
    },
    font: 'serif',
    description: 'Nuansa Jepang elegan dengan aksen emas',
  },
  {
    id: 'korean',
    name: 'Korean BBQ Neon',
    colors: {
      primary: '#FF1493',
      secondary: '#1A1A2E',
      accent: '#00F5FF',
      background: '#0D0D1A',
      surface: '#1A1A2E',
      text: '#FFFFFF',
      textSecondary: '#B0B0C0',
      border: '#FF1493',
      promo: '#FF69B4',
      glow: 'rgba(255, 20, 147, 0.4)',
    },
    font: 'sans-serif',
    description: 'Neon jalanan Seoul yang berenergi',
  },
  {
    id: 'western',
    name: 'Western Steakhouse Rustic',
    colors: {
      primary: '#5C3A1E',
      secondary: '#2C1810',
      accent: '#FFB347',
      background: '#1A0F0A',
      surface: '#2C1810',
      text: '#F5E6D3',
      textSecondary: '#C4A882',
      border: '#FFB347',
      promo: '#FF8C00',
      glow: 'rgba(255, 179, 71, 0.3)',
    },
    font: 'serif',
    description: 'Hangatnya steakhouse rustic ala barat',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Street Grill',
    colors: {
      primary: '#00FFFF',
      secondary: '#FF00FF',
      accent: '#FFFF00',
      background: '#0A0A0F',
      surface: '#12121A',
      text: '#E0E0FF',
      textSecondary: '#8888AA',
      border: '#00FFFF',
      promo: '#FF00FF',
      glow: 'rgba(0, 255, 255, 0.4)',
    },
    font: 'monospace',
    description: 'Futuristik cyberpunk dengan neon menyala',
  },
  {
    id: 'warung',
    name: 'Warung Nusantara Kekinian',
    colors: {
      primary: '#4A7C59',
      secondary: '#2D1810',
      accent: '#D4A73C',
      background: '#1A1410',
      surface: '#2A2018',
      text: '#F0E6D8',
      textSecondary: '#B8A890',
      border: '#D4A73C',
      promo: '#C0392B',
      glow: 'rgba(212, 167, 60, 0.3)',
    },
    font: 'serif',
    description: 'Nuansa Nusantara yang hangat dan stylish',
  },
]

export function getRandomTheme(activeThemes: string[]): Theme {
  const available = themes.filter(t => activeThemes.includes(t.id))
  const pool = available.length > 0 ? available : themes
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getThemeById(id: string): Theme | undefined {
  return themes.find(t => t.id === id)
}
