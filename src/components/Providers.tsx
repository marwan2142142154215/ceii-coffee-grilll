'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 2000,
              style: {
                background: '#1A1A1A',
                color: '#F5F0E8',
                border: '1px solid rgba(212, 167, 60, 0.3)',
                borderRadius: '8px',
                fontSize: '14px',
              },
            }}
          />
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
