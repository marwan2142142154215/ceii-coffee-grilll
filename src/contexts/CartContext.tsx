'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { Product } from '@/types'

interface CartItem {
  product: Product
  qty: number
  catatan?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  updateCatatan: (productId: string, catatan: string) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  updateCatatan: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        )
      }
      return [...prev, { product, qty: 1 }]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }, [])

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(productId)
      return
    }
    setItems(prev => prev.map(i =>
      i.product.id === productId ? { ...i, qty } : i
    ))
  }, [removeItem])

  const updateCatatan = useCallback((productId: string, catatan: string) => {
    setItems(prev => prev.map(i =>
      i.product.id === productId ? { ...i, catatan } : i
    ))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0)
  const subtotal = items.reduce((sum, i) => {
    const price = i.product.is_promo && i.product.promo_price ? i.product.promo_price : i.product.price
    return sum + price * i.qty
  }, 0)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, updateCatatan, clearCart,
      totalItems, subtotal,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
