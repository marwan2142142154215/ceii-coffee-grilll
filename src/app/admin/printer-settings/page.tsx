'use client'

import { useState } from 'react'
import { Printer } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPrinterSettings() {
  const [settings, setSettings] = useState({
    paperSize: '58mm',
    showLogo: true,
    showTableNumber: true,
    showNotes: true,
  })

  function printPreview() {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Izinkan pop-up untuk preview cetak')
      return
    }

    printWindow.document.write(`
      <html>
      <head><title>Preview Struk</title>
      <style>
        body { font-family: 'Courier New', monospace; width: ${settings.paperSize === '58mm' ? '200px' : '280px'}; margin: 0 auto; padding: 10px; font-size: 12px; }
        h1 { text-align: center; font-size: 16px; margin-bottom: 4; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .item { display: flex; justify-content: space-between; }
        .footer { text-align: center; margin-top: 12; font-size: 10px; }
        @media print { body { width: ${settings.paperSize === '58mm' ? '200px' : '280px'}; margin: 0; } }
      </style>
      </head><body>
        ${settings.showLogo ? '<h1>🔥 CEII Coffee & Grill</h1>' : ''}
        <div class="line"></div>
        <p>Pesanan #123 • ${new Date().toLocaleDateString('id-ID')}</p>
        <p>Pelanggan: Bembeng</p>
        ${settings.showTableNumber ? '<p>Meja: 5</p>' : ''}
        <div class="line"></div>
        <div class="item"><span>Paket Grill x2</span><span>Rp 90.000</span></div>
        ${settings.showNotes ? '<p style="font-size:10px;color:#666">  Catatan: Pedas dikit</p>' : ''}
        <div class="item"><span>Es Kopi x1</span><span>Rp 25.000</span></div>
        <div class="line"></div>
        <div class="item"><strong>Total</strong><strong>Rp 115.000</strong></div>
        <div class="footer">Terima kasih! 🎉</div>
      </body></html>
    `)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 500)
    toast.success('Preview struk dibuka')
  }

  return (
    <div style={{ padding: 24, maxWidth: 500 }}>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 20 }}>Pengaturan Printer</h1>

      <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e0ddd5' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Ukuran Kertas Struk</label>
          <select value={settings.paperSize} onChange={e => setSettings(p => ({ ...p, paperSize: e.target.value }))}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none' }}>
            <option value="58mm">58 mm (thermal kecil)</option>
            <option value="80mm">80 mm (thermal besar)</option>
          </select>
        </div>

        {[
          { key: 'showLogo', label: 'Tampilkan logo toko' },
          { key: 'showTableNumber', label: 'Tampilkan nomor meja' },
          { key: 'showNotes', label: 'Tampilkan catatan pesanan' },
        ].map(item => (
          <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 10 }}>
            <input type="checkbox" checked={(settings as any)[item.key]}
              onChange={e => setSettings(p => ({ ...p, [item.key]: e.target.checked }))} />
            <span style={{ fontSize: 13 }}>{item.label}</span>
          </label>
        ))}

        <button onClick={printPreview}
          style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '10px 20px', background: '#D4A73C', color: '#000', border: 'none', borderRadius: 10, fontWeight: 'bold', fontSize: 13, cursor: 'pointer' }}>
          <Printer size={16} /> Preview Struk
        </button>
      </div>
    </div>
  )
}
