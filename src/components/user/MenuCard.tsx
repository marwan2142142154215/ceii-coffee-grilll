'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Product } from '@/types'
import { useTheme } from '@/contexts/ThemeContext'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, calculateDiscount } from '@/lib/utils'

export default function MenuCard({ product }: { product: Product }) {
  const { theme } = useTheme()
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    if (!product.is_available) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 600)
  }

  const displayPrice = product.is_promo && product.promo_price ? product.promo_price : product.price
  const discount = product.is_promo && product.promo_price ? calculateDiscount(product.price, product.promo_price) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      style={{
        background: theme.colors.surface,
        borderRadius: 14, overflow: 'hidden',
        border: product.is_promo ? `1.5px solid ${theme.colors.border}` : '1px solid transparent',
        boxShadow: product.is_promo ? `0 0 15px ${theme.colors.glow}` : 'none',
        opacity: product.is_available ? 1 : 0.6,
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: `linear-gradient(135deg, ${theme.colors.secondary}, ${theme.colors.background})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40,
          }}>🍽️</div>
        )}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          padding: '24px 10px 8px',
        }} />
        {product.is_promo && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: theme.colors.promo,
            color: '#000', fontSize: 10, fontWeight: 'bold',
            padding: '3px 8px', borderRadius: 6,
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}>
            {discount > 0 ? `DISKON ${discount}%` : 'PROMO'}
          </div>
        )}
        {!product.is_available && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: '#e74c3c', color: '#fff',
            fontSize: 10, fontWeight: 'bold',
            padding: '3px 8px', borderRadius: 6,
          }}>
            HABIS
          </div>
        )}
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <h3 style={{
          fontFamily: theme.font, fontSize: 14, fontWeight: 'bold',
          color: theme.colors.text, margin: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{product.name}</h3>
        {product.description && (
          <p style={{
            color: theme.colors.textSecondary, fontSize: 11, marginTop: 4, marginBottom: 8,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', lineHeight: 1.3,
          }}>{product.description}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <div>
            {product.is_promo && product.promo_price ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  color: theme.colors.textSecondary, fontSize: 11,
                  textDecoration: 'line-through',
                }}>{formatPrice(product.price)}</span>
                <span style={{
                  color: theme.colors.accent, fontSize: 14, fontWeight: 'bold',
                  fontFamily: 'var(--font-mono)',
                }}>{formatPrice(product.promo_price)}</span>
              </div>
            ) : (
              <span style={{
                color: theme.colors.text, fontSize: 14, fontWeight: 'bold',
                fontFamily: 'var(--font-mono)',
              }}>{formatPrice(product.price)}</span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAdd}
            disabled={!product.is_available}
            style={{
              background: product.is_available ? theme.colors.accent : '#555',
              border: 'none', borderRadius: 10,
              padding: '6px 12px', cursor: product.is_available ? 'pointer' : 'not-allowed',
              color: product.is_available ? '#000' : '#999',
              fontSize: 12, fontWeight: 'bold',
              display: 'flex', alignItems: 'center', gap: 4,
              opacity: product.is_available ? 1 : 0.5,
            }}
          >
            <motion.span
              animate={added ? { rotate: [0, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <Plus size={14} />
            </motion.span>
            {product.is_available ? 'Tambah' : 'Habis'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
