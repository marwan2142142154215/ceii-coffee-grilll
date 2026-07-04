export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

export function calculateDiscount(original: number, promo: number): number {
  return Math.round(((original - promo) / original) * 100)
}

export function isValidUrl(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

export function detectMediaType(url: string): 'image' | 'gif' | 'video' | 'youtube' | 'tiktok' | 'unknown' {
  const ext = url.split('.').pop()?.toLowerCase()
  if (ext === 'gif') return 'gif'
  if (['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(ext || '')) return 'image'
  if (['mp4', 'webm', 'ogg'].includes(ext || '')) return 'video'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (ext === 'mp4' || ext === 'webm') return 'video'
  return 'image'
}

export function generateOrderMessage(params: {
  items: { name: string; qty: number; harga: number; catatan?: string }[]
  total: number
  customerName: string
  nomorMeja?: string
  catatan?: string
}): string {
  let msg = `🍽 *PESANAN BARU - CEII Coffee & Grill*\n`
  msg += `─────────────────\n`
  msg += `👤 *Nama:* ${params.customerName}\n`
  if (params.nomorMeja) msg += `🪑 *Meja:* ${params.nomorMeja}\n`
  msg += `\n*Pesanan:*\n`
  params.items.forEach((item, i) => {
    msg += `${i + 1}. ${item.name} x${item.qty} = Rp ${(item.harga * item.qty).toLocaleString()}`
    if (item.catatan) msg += `\n   📝 Catatan: ${item.catatan}`
    msg += `\n`
  })
  msg += `\n─────────────────\n`
  msg += `💰 *Total: Rp ${params.total.toLocaleString()}*\n`
  if (params.catatan) msg += `\n📌 *Catatan Tambahan:* ${params.catatan}\n`
  msg += `\n✅ Terima kasih, pesanan akan segera diproses!`
  return encodeURIComponent(msg)
}
