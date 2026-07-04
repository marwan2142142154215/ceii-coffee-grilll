export interface Category {
  id: string
  name: string
  icon?: string
  order: number
  created_at?: string
}

export interface Product {
  id: string
  category_id: string
  name: string
  description?: string
  price: number
  image_url?: string
  is_available: boolean
  is_promo: boolean
  promo_price?: number
  variants?: string
  order: number
  created_at?: string
}

export interface StoreSettings {
  id: string
  whatsapp_number: string
  telegram_username: string
  telegram_link: string
  instagram_link: string
  facebook_link: string
  store_name: string
  store_logo_url: string
  banner_promo_url: string
  banner_promo_active: boolean
  alamat_toko: string
  jam_operasional: string
  web_user_url: string
  loading_media_url: string
  active_themes: string[]
  dine_in_active: boolean
  store_closed: boolean
  kitchen_pin: string
  created_at?: string
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  customer_name: string
  nomor_meja?: string
  catatan?: string
  status: 'baru' | 'diterima' | 'dimasak' | 'selesai'
  created_at: string
}

export interface OrderItem {
  name: string
  qty: number
  harga: number
  catatan?: string
}

export interface Visit {
  id: string
  timestamp: string
  negara: string
  kota: string
  device_type: 'HP' | 'Tablet' | 'PC'
  source: string
  browser: string
  location_accuracy: 'gps' | 'ip_estimate'
}

export interface AdminAccount {
  id: string
  username: string
  password_hash: string
  created_at: string
}

export interface Banner {
  id: string
  judul: string
  sub_teks?: string
  image_url: string
  active: boolean
  tombol_aksi?: string
  created_at?: string
}

export interface Voucher {
  id: string
  kode: string
  persen?: number
  nominal?: number
  kuota: number
  masa_berlaku: string
  created_at?: string
}

export type ThemeId = 'japanese' | 'korean' | 'western' | 'cyberpunk' | 'warung'

export interface Theme {
  id: ThemeId
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    promo: string
    glow: string
  }
  font: string
  description: string
}
