'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { QRCodeSVG } from 'qrcode.react'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminQRCode() {
  const [url, setUrl] = useState('')
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.from('store_settings').select('web_user_url').single().then(({ data }: { data: any }) => {
      if (data?.web_user_url) setUrl(data.web_user_url)
    })
    const sub = supabase.channel('admin-qr').on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'store_settings',
    }, (payload: any) => {
      const newData = payload.new as any
      if (newData?.web_user_url) setUrl(newData.web_user_url)
    }).subscribe()
    return () => { sub.unsubscribe() }
  }, [])

  function downloadQR() {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width * 2
      canvas.height = img.height * 2
      ctx!.scale(2, 2)
      ctx!.fillStyle = '#0D0D0D'
      ctx!.fillRect(0, 0, canvas.width, canvas.height)
      ctx!.drawImage(img, 0, 0)
      const link = document.createElement('a')
      link.download = 'ceii-qr-code.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('QR Code diunduh!')
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <div style={{ padding: 24, maxWidth: 500 }}>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 }}>QR Code</h1>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
        Scan QR untuk membuka menu digital CEII Coffee & Grill
      </p>

      {url ? (
        <div style={{ textAlign: 'center' }}>
          <div ref={qrRef} style={{
            display: 'inline-block', background: '#fff', padding: 24,
            borderRadius: 16, border: '1px solid #e0ddd5', marginBottom: 16,
          }}>
            <QRCodeSVG value={url} size={200} fgColor="#1A1A1A" bgColor="#FFFFFF" />
          </div>
          <p style={{ fontSize: 12, color: '#888', wordBreak: 'break-all', marginBottom: 16, maxWidth: 400 }}>
            {url}
          </p>
          <button onClick={downloadQR}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 24px', background: '#D4A73C', color: '#000', border: 'none', borderRadius: 10, fontWeight: 'bold', fontSize: 14, cursor: 'pointer' }}>
            <Download size={18} /> Download QR
          </button>
        </div>
      ) : (
        <p style={{ color: '#e74c3c', fontSize: 13 }}>
          Atur URL Web User di menu Pengaturan Toko terlebih dahulu
        </p>
      )}
    </div>
  )
}
