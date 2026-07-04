'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { StoreSettings } from '@/types'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'

export default function AdminStoreSettings() {
  const [form, setForm] = useState<Partial<StoreSettings>>({})

  useEffect(() => {
    loadSettings()
    const sub = supabase.channel('admin-settings').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'store_settings' }, () => loadSettings()).subscribe()
    return () => { sub.unsubscribe() }
  }, [])

  async function loadSettings() {
    const { data } = await supabase.from('store_settings').select('*').single()
    if (data) setForm(data)
  }

  async function save() {
    const { error } = await supabase.from('store_settings').update({
      store_name: form.store_name,
      store_logo_url: form.store_logo_url,
      whatsapp_number: form.whatsapp_number,
      telegram_username: form.telegram_username,
      telegram_link: form.telegram_link,
      instagram_link: form.instagram_link,
      facebook_link: form.facebook_link,
      alamat_toko: form.alamat_toko,
      jam_operasional: form.jam_operasional,
      web_user_url: form.web_user_url,
      loading_media_url: form.loading_media_url,
      banner_promo_url: form.banner_promo_url,
      banner_promo_active: form.banner_promo_active ?? false,
      dine_in_active: form.dine_in_active ?? true,
      store_closed: form.store_closed ?? false,
      kitchen_pin: form.kitchen_pin || '1234',
      active_themes: form.active_themes || ['japanese', 'korean', 'western', 'cyberpunk', 'warung'],
    }).eq('id', form.id!)

    if (error) { toast.error('Gagal menyimpan: ' + error.message); return }
    toast.success('Pengaturan tersimpan!')
  }

  const fields = [
    { key: 'store_name', label: 'Nama Toko', type: 'text' },
    { key: 'store_logo_url', label: 'URL Logo', type: 'text' },
    { key: 'whatsapp_number', label: 'Nomor WhatsApp', type: 'text', placeholder: '628xxx' },
    { key: 'telegram_username', label: 'Username Telegram', type: 'text', placeholder: '@username' },
    { key: 'telegram_link', label: 'Link Telegram', type: 'text' },
    { key: 'instagram_link', label: 'Link Instagram', type: 'text' },
    { key: 'facebook_link', label: 'Link Facebook', type: 'text' },
    { key: 'alamat_toko', label: 'Alamat Toko', type: 'text' },
    { key: 'jam_operasional', label: 'Jam Operasional', type: 'text', placeholder: 'Sen-Min 17:00-23:00' },
    { key: 'web_user_url', label: 'URL Web User (untuk QR)', type: 'text' },
    { key: 'loading_media_url', label: 'URL Loading Screen', type: 'text' },
    { key: 'kitchen_pin', label: 'PIN Dapur (4-6 digit)', type: 'text' },
  ]

  return (
    <div style={{ padding: 24, maxWidth: 700 }}>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 20 }}>Pengaturan Toko</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{f.label}</label>
            <input value={(form as any)[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              placeholder={(f as any).placeholder || ''}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none' }} />
          </div>
        ))}

        {['banner_promo_active', 'dine_in_active', 'store_closed'].map(key => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={(form as any)[key] || false}
              onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))} />
            <span style={{ fontSize: 13 }}>
              {key === 'banner_promo_active' ? 'Aktifkan Banner Promo' :
               key === 'dine_in_active' ? 'Aktifkan Mode Dine-in (nomor meja)' :
               'Mode Toko Tutup'}
            </span>
          </label>
        ))}
      </div>

      <button onClick={save}
        style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 20, padding: '10px 24px', background: '#D4A73C', color: '#000', border: 'none', borderRadius: 10, fontWeight: 'bold', fontSize: 14, cursor: 'pointer' }}>
        <Save size={18} /> Simpan Pengaturan
      </button>
    </div>
  )
}
