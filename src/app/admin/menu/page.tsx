'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Category, Product } from '@/types'
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminMenu() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', category_id: '', image_url: '', is_available: true, order: '' })
  const [showCatForm, setShowCatForm] = useState(false)
  const [catForm, setCatForm] = useState({ name: '', icon: '' })

  useEffect(() => {
    loadData()
    const catSub = supabase.channel('admin-menu-cat').on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => loadData()).subscribe()
    const prodSub = supabase.channel('admin-menu-prod').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => loadData()).subscribe()
    return () => { catSub.unsubscribe(); prodSub.unsubscribe() }
  }, [])

  async function loadData() {
    const [catRes, prodRes] = await Promise.all([
      supabase.from('categories').select('*').order('order'),
      supabase.from('products').select('*').order('order'),
    ])
    if (catRes.data) setCategories(catRes.data)
    if (prodRes.data) setProducts(prodRes.data)
  }

  function newItem() {
    setEditing(null)
    setForm({ name: '', description: '', price: '', category_id: categories[0]?.id || '', image_url: '', is_available: true, order: String(products.length + 1) })
    setShowForm(true)
  }

  function editItem(p: Product) {
    setEditing(p)
    setForm({ name: p.name, description: p.description || '', price: String(p.price), category_id: p.category_id, image_url: p.image_url || '', is_available: p.is_available, order: String(p.order) })
    setShowForm(true)
  }

  async function save() {
    if (!form.name.trim() || !form.price || Number(form.price) < 0) {
      toast.error('Nama dan harga wajib diisi dengan benar')
      return
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      category_id: form.category_id,
      image_url: form.image_url.trim() || null,
      is_available: form.is_available,
      order: Number(form.order) || 0,
    }

    if (editing) {
      const { error } = await supabase.from('products').update(payload).eq('id', editing.id)
      if (error) { toast.error('Gagal menyimpan: ' + error.message); return }
      toast.success('Produk berhasil disimpan')
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) { toast.error('Gagal menambah: ' + error.message); return }
      toast.success('Produk berhasil ditambah')
    }
    setShowForm(false)
    loadData()
  }

  async function remove(id: string) {
    if (!confirm('Hapus produk ini?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) { toast.error('Gagal menghapus: ' + error.message); return }
    toast.success('Produk dihapus')
    loadData()
  }

  async function saveCategory() {
    if (!catForm.name.trim()) { toast.error('Nama kategori wajib diisi'); return }
    const { error } = await supabase.from('categories').insert({ name: catForm.name.trim(), icon: catForm.icon.trim() || null, order: categories.length })
    if (error) { toast.error('Gagal: ' + error.message); return }
    toast.success('Kategori ditambah')
    setShowCatForm(false)
    setCatForm({ name: '', icon: '' })
    loadData()
  }

  async function removeCategory(id: string) {
    const count = products.filter(p => p.category_id === id).length
    if (count > 0 && !confirm(`Hapus "${categories.find(c => c.id === id)?.name}"? ${count} produk akan kehilangan kategori ini.`)) return
    if (count === 0 && !confirm(`Hapus kategori "${categories.find(c => c.id === id)?.name}"?`)) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) { toast.error('Gagal: ' + error.message); return }
    toast.success('Kategori dihapus')
    loadData()
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', margin: 0 }}>Kelola Menu</h1>
        <button onClick={newItem}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#D4A73C', color: '#000', border: 'none', borderRadius: 10, fontWeight: 'bold', fontSize: 13, cursor: 'pointer' }}>
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      {showForm && (
        <div style={{
          background: '#fff', borderRadius: 14, padding: 20, marginBottom: 20,
          border: '1px solid #e0ddd5',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Nama *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Harga *</label>
              <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Kategori</label>
              <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none' }}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>URL Foto</label>
              <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Deskripsi</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={2} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Urutan</label>
              <input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_available} onChange={e => setForm(p => ({ ...p, is_available: e.target.checked }))} />
                <span style={{ fontSize: 13 }}>Tersedia</span>
              </label>
            </div>
          </div>
          {form.image_url && (
            <div style={{ marginTop: 8 }}>
              <img src={form.image_url} alt="preview"
                style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={save}
              style={{ padding: '8px 20px', background: '#D4A73C', color: '#000', border: 'none', borderRadius: 8, fontWeight: 'bold', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Check size={16} /> Simpan
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ padding: '8px 20px', background: '#eee', color: '#666', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <X size={16} /> Batal
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 'bold', color: '#333', margin: 0 }}>Kategori</h2>
        <button onClick={() => { setShowCatForm(true); setCatForm({ name: '', icon: '' }) }}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', background: '#D4A73C', color: '#000', border: 'none', borderRadius: 8, fontWeight: 'bold', fontSize: 12, cursor: 'pointer' }}>
          <Plus size={14} /> Tambah
        </button>
      </div>

      {showCatForm && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          <input value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Nama kategori"
            style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 12, outline: 'none', width: 160 }} />
          <input value={catForm.icon} onChange={e => setCatForm(f => ({ ...f, icon: e.target.value }))}
            placeholder="Ikon (emoji)"
            style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 12, outline: 'none', width: 80 }} />
          <button onClick={saveCategory}
            style={{ padding: '6px 14px', background: '#D4A73C', color: '#000', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 'bold', cursor: 'pointer' }}>
            <Check size={14} />
          </button>
          <button onClick={() => setShowCatForm(false)}
            style={{ padding: '6px 14px', background: '#eee', color: '#666', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {categories.map(c => (
          <div key={c.id} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 8px 4px 12px', background: '#fff', borderRadius: 20,
            border: '1px solid #e0ddd5', fontSize: 12, color: '#555',
          }}>
            {c.icon && <span style={{ marginRight: 2 }}>{c.icon}</span>}
            {c.name}
            <button onClick={() => removeCategory(c.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: '2px', display: 'flex' }}>
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 'bold', color: '#333', margin: '0 0 12' }}>Produk ({products.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
        {products.map(p => (
          <div key={p.id} style={{
            background: '#fff', borderRadius: 12, padding: 12,
            border: '1px solid #e0ddd5', display: 'flex', gap: 10,
          }}>
            {p.image_url ? (
              <img src={p.image_url} alt={p.name}
                style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 60, height: 60, borderRadius: 8, background: '#f0efe8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🍽️</div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h3 style={{ fontSize: 13, fontWeight: 'bold', color: '#1A1A1A', margin: 0 }}>{p.name}</h3>
                {!p.is_available && <span style={{ fontSize: 10, color: '#fff', background: '#e74c3c', padding: '1px 6px', borderRadius: 4 }}>Habis</span>}
                {p.is_promo && <span style={{ fontSize: 10, color: '#fff', background: '#D4A73C', padding: '1px 6px', borderRadius: 4 }}>Promo</span>}
              </div>
              <p style={{ fontSize: 11, color: '#888', margin: '2px 0' }}>Rp {p.price.toLocaleString()}</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <button onClick={() => editItem(p)}
                  style={{ padding: '3px 8px', background: '#f0efe8', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => remove(p.id)}
                  style={{ padding: '3px 8px', background: '#fde8e8', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3, color: '#e74c3c' }}>
                  <Trash2 size={12} /> Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
