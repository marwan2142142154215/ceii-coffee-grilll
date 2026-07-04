'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, MessageCircle, Send } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, generateOrderMessage } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { theme } = useTheme()
  const { items, updateQty, updateCatatan, removeItem, clearCart, subtotal } = useCart()
  const [customerName, setCustomerName] = useState('')
  const [nomorMeja, setNomorMeja] = useState('')
  const [catatan, setCatatan] = useState('')
  const [waNumber, setWaNumber] = useState('')
  const [telegramLink, setTelegramLink] = useState('')
  const [dineInActive, setDineInActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.from('store_settings').select('whatsapp_number, telegram_link, dine_in_active').single().then(({ data }: { data: any }) => {
      if (data) {
        setWaNumber(data.whatsapp_number)
        setTelegramLink(data.telegram_link)
        setDineInActive(data.dine_in_active ?? true)
      }
    })
  }, [])

  async function handleCheckoutWA() {
    if (!customerName.trim()) {
      toast.error('Nama pemesan wajib diisi')
      return
    }
    if (items.length === 0) return

    setSubmitting(true)
    try {
      const orderItems = items.map(i => ({
        name: i.product.name,
        qty: i.qty,
        harga: i.product.is_promo && i.product.promo_price ? i.product.promo_price : i.product.price,
        catatan: i.catatan,
      }))

      const msg = generateOrderMessage({
        items: orderItems,
        total: subtotal,
        customerName: customerName.trim(),
        nomorMeja: nomorMeja || undefined,
        catatan: catatan || undefined,
      })

      await supabase.from('orders').insert({
        items: orderItems,
        total: subtotal,
        customer_name: customerName.trim(),
        nomor_meja: nomorMeja || null,
        catatan: catatan || null,
        status: 'baru',
      })

      clearCart()
      setCustomerName('')
      setNomorMeja('')
      setCatatan('')
      onClose()
      toast.success('Pesanan berhasil dikirim!')

      window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank')
    } catch (err) {
      toast.error('Gagal mengirim pesanan')
    } finally {
      setSubmitting(false)
    }
  }

  function handleCheckoutTelegram() {
    if (!customerName.trim()) {
      toast.error('Nama pemesan wajib diisi')
      return
    }
    if (items.length === 0 || !telegramLink) return

    const orderItems = items.map(i => ({
      name: i.product.name,
      qty: i.qty,
      harga: i.product.is_promo && i.product.promo_price ? i.product.promo_price : i.product.price,
      catatan: i.catatan,
    }))

    const msg = generateOrderMessage({
      items: orderItems,
      total: subtotal,
      customerName: customerName.trim(),
      nomorMeja: nomorMeja || undefined,
      catatan: catatan || undefined,
    })

    const textSummary = items.map(i =>
      `${i.product.name} x${i.qty} = Rp ${( (i.product.is_promo && i.product.promo_price ? i.product.promo_price : i.product.price) * i.qty).toLocaleString()}${i.catatan ? ` (${i.catatan})` : ''}`
    ).join('\n')

    const fullMsg = `PESANAN SAYA:\n${textSummary}\n\nTotal: Rp ${subtotal.toLocaleString()}\nAtas nama: ${customerName}${nomorMeja ? `\nMeja: ${nomorMeja}` : ''}${catatan ? `\nCatatan: ${catatan}` : ''}`

    navigator.clipboard.writeText(fullMsg)
    toast.success('Ringkasan pesanan di-copy!')

    window.open(telegramLink, '_blank')

    supabase.from('orders').insert({
      items: orderItems,
      total: subtotal,
      customer_name: customerName.trim(),
      nomor_meja: nomorMeja || null,
      catatan: catatan || null,
      status: 'baru',
    }).then(() => {
      clearCart()
      setCustomerName('')
      setNomorMeja('')
      setCatatan('')
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              zIndex: 500,
            }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', right: 0, top: 0, bottom: 0,
              width: '100%', maxWidth: 400,
              background: theme.colors.surface,
              zIndex: 501, display: 'flex', flexDirection: 'column',
              borderLeft: `1px solid ${theme.colors.border}30`,
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: `1px solid ${theme.colors.border}20`,
            }}>
              <h2 style={{ fontFamily: theme.font, fontSize: 18, fontWeight: 'bold', color: theme.colors.text, margin: 0 }}>
                Keranjang ({items.length})
              </h2>
              <button onClick={onClose}
                style={{ background: 'none', border: 'none', color: theme.colors.textSecondary, cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: theme.colors.textSecondary }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                  <p>Keranjang masih kosong</p>
                  <p style={{ fontSize: 12 }}>Tambahkan menu favorit kamu!</p>
                </div>
              ) : (
                items.map(item => {
                  const price = item.product.is_promo && item.product.promo_price ? item.product.promo_price : item.product.price
                  return (
                    <div key={item.product.id}
                      style={{
                        display: 'flex', gap: 10, padding: '10px 0',
                        borderBottom: `1px solid ${theme.colors.border}10`,
                      }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.text, margin: 0 }}>
                          {item.product.name}
                        </h4>
                        <p style={{ color: theme.colors.accent, fontSize: 13, fontFamily: 'var(--font-mono)', margin: '2px 0 4px' }}>
                          {formatPrice(price)}
                        </p>
                        <input
                          value={item.catatan || ''}
                          onChange={e => updateCatatan(item.product.id, e.target.value)}
                          placeholder="Catatan (opsional)"
                          style={{
                            width: '100%', padding: '4px 8px', borderRadius: 6,
                            border: `1px solid ${theme.colors.border}30`,
                            background: theme.colors.background,
                            color: theme.colors.text, fontSize: 11,
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => updateQty(item.product.id, item.qty - 1)}
                          style={{ background: theme.colors.background, border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', color: theme.colors.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.qty === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                        </button>
                        <span style={{ color: theme.colors.text, fontWeight: 'bold', fontSize: 14, minWidth: 20, textAlign: 'center' }}>
                          {item.qty}
                        </span>
                        <button onClick={() => updateQty(item.product.id, item.qty + 1)}
                          style={{ background: theme.colors.accent + '30', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', color: theme.colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {items.length > 0 && (
              <div style={{
                padding: '12px 16px 20px',
                borderTop: `1px solid ${theme.colors.border}20`,
              }}>
                {dineInActive && (
                  <input
                    value={nomorMeja}
                    onChange={e => setNomorMeja(e.target.value)}
                    placeholder="Nomor meja (opsional)"
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8,
                      border: `1px solid ${theme.colors.border}30`,
                      background: theme.colors.background,
                      color: theme.colors.text, fontSize: 13, marginBottom: 8,
                      outline: 'none',
                    }}
                  />
                )}
                <input
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Nama pemesan *"
                  required
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: `1px solid ${theme.colors.border}30`,
                    background: theme.colors.background,
                    color: theme.colors.text, fontSize: 13, marginBottom: 8,
                    outline: 'none',
                  }}
                />
                <input
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  placeholder="Catatan tambahan (opsional)"
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: `1px solid ${theme.colors.border}30`,
                    background: theme.colors.background,
                    color: theme.colors.text, fontSize: 13, marginBottom: 12,
                    outline: 'none',
                  }}
                />
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  color: theme.colors.text, fontSize: 16, fontWeight: 'bold',
                  marginBottom: 12,
                }}>
                  <span>Total</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: theme.colors.accent }}>
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {waNumber && (
                    <button onClick={handleCheckoutWA} disabled={submitting}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 6, padding: '10px 16px', borderRadius: 10,
                        background: '#25D366', color: '#fff', border: 'none',
                        fontSize: 13, fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.6 : 1,
                      }}>
                      <MessageCircle size={16} />
                  WA
                    </button>
                  )}
                  {telegramLink && (
                    <button onClick={handleCheckoutTelegram} disabled={submitting}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 6, padding: '10px 16px', borderRadius: 10,
                        background: '#0088cc', color: '#fff', border: 'none',
                        fontSize: 13, fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.6 : 1,
                      }}>
                      <Send size={16} />
                  Telegram
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
